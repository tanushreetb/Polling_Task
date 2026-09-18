package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"pulsevote/backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin WebSocket connections
	},
}

// Client represents a connected browser client
type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	pollID string
}

// Hub maintains the set of active clients and broadcasts messages received from Redis Pub/Sub
type Hub struct {
	pollID     string
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
	cancelSub  func()
}

var (
	hubsMu sync.RWMutex
	hubs   = make(map[string]*Hub)
)

// GetOrCreateHub gets or creates a Hub for a specific poll
func GetOrCreateHub(pollID string, redisSvc *services.RedisService) *Hub {
	hubsMu.Lock()
	defer hubsMu.Unlock()

	if hub, exists := hubs[pollID]; exists {
		return hub
	}

	hub := &Hub{
		pollID:     pollID,
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	hubs[pollID] = hub

	// Start hub event pump
	go hub.run()

	// Subscribe this hub to the Redis Pub/Sub channel for this poll
	ctx := context.Background()
	msgChan, cleanup, err := redisSvc.Subscribe(ctx, pollID)
	if err == nil {
		hub.cancelSub = cleanup
		go func() {
			for msg := range msgChan {
				hub.broadcast <- []byte(msg)
			}
		}()
	}

	return hub
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			count := len(h.clients)
			h.mu.Unlock()

			// Broadcast updated live viewer count
			viewerMsg, _ := json.Marshal(gin.H{
				"type":        "VIEWER_COUNT",
				"poll_id":     h.pollID,
				"live_viewers": count,
			})
			h.broadcastMessage(viewerMsg)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			count := len(h.clients)
			h.mu.Unlock()

			// Broadcast updated viewer count
			viewerMsg, _ := json.Marshal(gin.H{
				"type":        "VIEWER_COUNT",
				"poll_id":     h.pollID,
				"live_viewers": count,
			})
			h.broadcastMessage(viewerMsg)

		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

func (h *Hub) broadcastMessage(message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(25 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// ServeWebSocket upgrades HTTP request to Gorilla WebSocket and connects client to poll hub
func ServeWebSocket(c *gin.Context, redisSvc *services.RedisService) {
	pollID := c.Query("poll_id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "poll_id query parameter is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade error: %v", err)
		return
	}

	hub := GetOrCreateHub(pollID, redisSvc)
	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		pollID: pollID,
	}

	client.hub.register <- client

	// Initial welcome message with active viewer count
	hub.mu.RLock()
	activeCount := len(hub.clients)
	hub.mu.RUnlock()

	welcomeMsg, _ := json.Marshal(gin.H{
		"type":        "CONNECTED",
		"poll_id":     pollID,
		"live_viewers": activeCount,
	})
	client.send <- welcomeMsg

	go client.writePump()
	go client.readPump()
}
