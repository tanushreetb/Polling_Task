package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pulsevote/backend/internal/handlers"
	"pulsevote/backend/internal/middleware"
	"pulsevote/backend/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("==================================================")
	log.Println("⚡ PulseVote High-Performance Real-Time Backend ⚡")
	log.Println("==================================================")

	// 1. Initialize Datastores
	mongoSvc := services.InitMongo()
	redisSvc := services.InitRedis()

	// 2. Start Background Redis ZSET -> MongoDB Durability Sync Worker (Every 10 seconds)
	mongoSvc.StartPeriodicSyncWorker(redisSvc, 10*time.Second)

	// 3. Initialize HTTP Routers & Handlers
	router := gin.Default()
	router.Use(middleware.SetupCORS())

	authHandler := handlers.NewAuthHandler(mongoSvc)
	pollHandler := handlers.NewPollHandler(mongoSvc, redisSvc)
	voteHandler := handlers.NewVoteHandler(mongoSvc, redisSvc)

	// Real-Time WebSocket Endpoint
	router.GET("/ws", func(c *gin.Context) {
		handlers.ServeWebSocket(c, redisSvc)
	})

	// Public Health Check
	healthHandler := func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"message":   "PulseVote API is running!",
			"timestamp": time.Now().UTC(),
			"services": gin.H{
				"redis":   "active (ZSET + Pub/Sub)",
				"mongodb": "active",
			},
		})
	}

	router.GET("/", healthHandler)
	router.GET("/health", healthHandler)
	router.GET("/api/health", healthHandler)

	// REST API Group
	api := router.Group("/api")
	{
		// Authentication Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthRequired(), authHandler.GetMe)
		}

		// Public & Voter Routes
		polls := api.Group("/polls")
		{
			polls.GET("", pollHandler.ListPolls)
			polls.GET("/:id", pollHandler.GetPoll)
			polls.GET("/:id/results", voteHandler.GetLiveResults)

			// Voting endpoint: supports anonymous or authenticated users
			polls.POST("/:id/vote", middleware.OptionalAuth(), voteHandler.CastVote)

			// Creator only: Create a new poll
			polls.POST("", middleware.AuthRequired(), pollHandler.CreatePoll)
		}

		// Host Dashboard Routes
		user := api.Group("/user")
		{
			user.GET("/polls", middleware.AuthRequired(), pollHandler.GetUserPolls)
		}
	}

	// 4. Graceful HTTP Server Startup
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 PulseVote Server listening on port http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server listen failed: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down PulseVote server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited cleanly.")
}
