# ⚡ PulseVote — Real-Time Polling Architecture

> **Good Questions Bring People Together.**  
> A high-throughput, real-time polling application engineered with **Go (Gin)**, **Gorilla WebSockets**, **Redis (Sorted Sets & Pub/Sub)**, and **MongoDB**, featuring a handcrafted botanical UI in **React (Vite, Tailwind CSS, Framer Motion)**.

---

## 📸 Architecture & Design Highlights

PulseVote faithfully reproduces the handcrafted, warm aesthetic from the evaluation design:
- **Warm Paper Tone Canvas (`#FAF8F3`)** with dark botanical green accents (`#133522`).
- **Playful Sticky Notes** with tape/pin styling in Butter Yellow (`#FEF8D3`), Peach (`#FFE7DB`), and Mint (`#E2F3E7`).
- **All 7 Evaluation Screens**:
  1. **Hero / Landing Page**: Hand-lettered bold headline, desk illustration, avatar stack ("Joined by 10K+ curious minds"), and pinned sticky notes.
  2. **Login & Register Modal**: Complete with "Welcome Back! :)" sticky note, OAuth triggers, and JWT auth.
  3. **Create Poll Screen**: Dynamic option reordering, option deletion, multiple choice and anonymous voting toggles, and "Ask. Share. See the world think." note.
  4. **Host Dashboard**: Sidebar navigation, 4 metric cards (12 Total, 8 Active, 1.8K Total Votes, 256 Unique Voters), recent polls table, and live status pills.
  5. **Vote Screen**: Live viewer counter, programming language badges (Python, JS, Java, Go), custom radio indicators, "Vote Now" button, and confetti triggers.
  6. **Live Results Screen**: Interactive **Bar View** & **Donut View** toggles, live Framer Motion progress bars, real-time vote totals, and botanical quote notes.
  7. **Mobile View Experience**: Interactive phone frame with search, category tabs, and floating action button.

---

## 🧠 Key Architectural Decisions

### Why Redis ZSET + Pub/Sub Over Hammering MongoDB?

In traditional CRUD applications, every cast vote generates a write query directly against the primary document store:
```
// ❌ Traditional Anti-Pattern:
db.polls.updateOne({ _id: pollId, "options.id": optId }, { $inc: { "options.$.votes": 1 } })
```

#### The Bottlenecks with Traditional Database Voting:
1. **Document Lock Contention & Write Amplification**: Under high concurrency (e.g., 5,000 users voting within seconds during a live stream), hundreds of concurrent writes hit the exact same MongoDB document, leading to thread waits, write queue saturation, and CPU spikes.
2. **Expensive Leaderboard Sorting**: Re-calculating ranks and sorting options requires full document scans and CPU-intensive sorting algorithms on every request.
3. **Polling Latency**: Clients must poll `GET /polls/:id` every 1-2 seconds, creating thousands of redundant HTTP requests and lagging user feedback.

#### The PulseVote Solution:
```
┌─────────────────┐       HTTP Vote        ┌─────────────────────────┐
│ React Frontend  │ ─────────────────────> │     Go Backend (Gin)    │
└─────────────────┘                        └─────────────────────────┘
        ▲                                     │                   │
        │ WebSocket Stream                    │ 1. ZINCRBY        │ 2. PUBLISH
        │                                     ▼                   ▼
┌─────────────────┐    Redis Pub/Sub       ┌─────────────────────────┐
│ Gorilla WS Hub  │ <───────────────────── │ Redis (ZSET & Pub/Sub)  │
└─────────────────┘                        └─────────────────────────┘
                                                      │
                                                      │ Background Sync Worker
                                                      │ (Ticker: every 10s)
                                                      ▼
                                           ┌─────────────────────────┐
                                           │   MongoDB (Durability)  │
                                           └─────────────────────────┘
```

1. **Redis Sorted Sets (ZSET)**:
   - Command: `ZINCRBY poll:{id}:votes 1 {option_id}`
   - **O(log N)** atomic score increment ensures instant, non-blocking updates in RAM.
   - Built-in instantaneous sorted rankings via `ZREVRANGEWITHSCORES` without taxing the primary database.
2. **Redis Pub/Sub**:
   - Command: `PUBLISH poll:{id}:events {payload}`
   - Decouples vote ingestion from frontend broadcasting.
   - Horizontally scalable: multiple Go backend replicas subscribe to the Redis channel and push live payloads to their respective WebSocket clients with zero lag.
3. **10-Second Asynchronous MongoDB Durability Worker**:
   - A dedicated Go background goroutine reads current Redis ZSET snapshots every 10 seconds and flushes updates to MongoDB in batches.
   - Preserves long-term audit history while completely removing write bottlenecks from the critical path.

---

## 🚀 How to Run Locally

### Prerequisites
- **Go** (1.21 or higher)
- **Node.js** (v18 or higher)
- **Docker** (optional, for running Redis and MongoDB)

---

### Step 1: Start Redis and MongoDB (Using Docker)

Run the following commands in your terminal:

```bash
# Run Redis
docker run -d --name pulsevote-redis -p 6379:6379 redis:alpine

# Run MongoDB
docker run -d --name pulsevote-mongo -p 27017:27017 mongo:latest
```

> **Note**: If you do not have Docker installed, the Go backend includes an **intelligent in-memory simulation engine** that automatically activates when Redis or MongoDB is unreachable, allowing full development without external dependencies!

---

### Step 2: Run the Go Backend

```bash
cd pulsevote/backend

# Download dependencies
go mod tidy

# Start the server (runs on port 8080)
go run ./cmd/server
```

You will see:
```
⚡ PulseVote High-Performance Real-Time Backend ⚡
[Sync Worker] Started Redis ZSET -> MongoDB sync worker (Interval: 10s)
🚀 PulseVote Server listening on port http://localhost:8080
```

---

### Step 3: Run the React Frontend

Open a second terminal window:

```bash
cd pulsevote/frontend

# Install dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

Use the **Screen Navigator pill** at the bottom of the screen to preview all 7 screens directly!

---

## 🌐 Production Deployment Guide

### 1. Go Backend (Render or Railway)
- **Environment Variables**:
  - `PORT`: `8080`
  - `GIN_MODE`: `release`
  - `JWT_SECRET`: `<generate-a-secure-random-32-character-key>`
  - `REDIS_ADDR`: `<your-upstash-redis-url>`
  - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
- **Build Command**: `go build -o server ./cmd/server`
- **Start Command**: `./server`

### 2. Managed Redis (Upstash)
1. Create a free Redis database on [Upstash](https://upstash.com/).
2. Copy the `rediss://...` connection string and assign it to `REDIS_ADDR`.

### 3. Managed MongoDB (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create database user credentials and allow IP access (`0.0.0.0/0`).
3. Copy the URI `mongodb+srv://<user>:<password>@cluster0.mongodb.net/pulsevote` into `MONGODB_URI`.

### 4. React Frontend (Vercel or Netlify)
- **Framework Preset**: Vite
- **Root Directory**: `pulsevote/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-deployed-backend>.onrender.com/api`
  - `VITE_WS_URL`: `wss://<your-deployed-backend>.onrender.com/ws`

---

## 🧪 Testing the Real-Time Voting Flow

1. Open `http://localhost:5173/` in two separate browser tabs side by side.
2. In Tab 1, switch to **5. Vote Screen**.
3. In Tab 2, switch to **6. Live Results**.
4. Cast a vote for **Python** or **JavaScript** in Tab 1.
5. Watch Tab 2 **instantly animate** the progress bars and recalculate percentages via WebSocket and Redis ZSET with **zero page refresh**!
