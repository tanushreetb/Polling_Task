# PulseVote — Real-Time Polling Application

The full implementation of **PulseVote** is located in the [`/pulsevote`](file:///d:/Projects/HCL%20GUVI%20TANU/pulsevote) directory:

- **Backend**: [`/pulsevote/backend`](file:///d:/Projects/HCL%20GUVI%20TANU/pulsevote/backend) (Go, Gin, Gorilla WebSocket, Redis ZSET + Pub/Sub, MongoDB, bcrypt, JWT)
- **Frontend**: [`/pulsevote/frontend`](file:///d:/Projects/HCL%20GUVI%20TANU/pulsevote/frontend) (React, Vite, Tailwind CSS, Framer Motion, Axios)
- **Architecture Documentation & Deployment**: [`/pulsevote/README.md`](file:///d:/Projects/HCL%20GUVI%20TANU/pulsevote/README.md)

### Quick Run (One-Click)
Double-click or run:
```cmd
start.bat
```

### Manual Run
1. Backend: `cd pulsevote/backend && go run ./cmd/server` (Port 8080)
2. Frontend: `cd pulsevote/frontend && npm run dev` (Port 5173)

