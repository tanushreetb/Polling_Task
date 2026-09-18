import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [activePollId, setActivePollId] = useState(null);
  const [liveEvent, setLiveEvent] = useState(null);
  const [viewerCount, setViewerCount] = useState(427); // Default matching screenshot
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const listenersRef = useRef(new Set());

  const subscribeToPoll = useCallback((pollId) => {
    setActivePollId(pollId);
  }, []);

  useEffect(() => {
    if (!activePollId) return;

    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws') + `?poll_id=${activePollId}`;
    let ws;
    let shouldReconnect = true;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.live_viewers) {
              setViewerCount(data.live_viewers);
            }
            if (data.options || data.total_votes !== undefined) {
              setLiveEvent(data);
              listenersRef.current.forEach((fn) => fn(data));
            }
          } catch (err) {
            console.warn('WS message parse error:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (shouldReconnect) {
            setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (ws) ws.close();
    };
  }, [activePollId]);

  const addVoteListener = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        activePollId,
        subscribeToPoll,
        liveEvent,
        viewerCount,
        isConnected,
        addVoteListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
