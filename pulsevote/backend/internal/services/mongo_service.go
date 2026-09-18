package services

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"pulsevote/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

// MongoService manages database operations with MongoDB and provides background sync from Redis ZSET
type MongoService struct {
	client     *mongo.Client
	db         *mongo.Database
	isFallback bool

	// In-memory store if MongoDB is offline in local dev environment
	mu          sync.RWMutex
	memoryUsers map[string]models.User
	memoryPolls map[string]models.Poll
}

var (
	mongoInstance *MongoService
	mongoOnce     sync.Once
)

// InitMongo initializes MongoDB or falls back to an in-memory database
func InitMongo() *MongoService {
	mongoOnce.Do(func() {
		uri := os.Getenv("MONGODB_URI")
		if uri == "" {
			uri = "mongodb://localhost:27017"
		}

		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		clientOpts := options.Client().ApplyURI(uri)
		client, err := mongo.Connect(ctx, clientOpts)

		isFallback := false
		var db *mongo.Database

		if err != nil || client.Ping(ctx, nil) != nil {
			log.Printf("[MongoDB] Warning: MongoDB connection failed at %s. Activating in-memory store for development.", uri)
			isFallback = true
		} else {
			log.Printf("[MongoDB] Connected successfully to MongoDB at %s", uri)
			db = client.Database("pulsevote")
		}

		mongoInstance = &MongoService{
			client:      client,
			db:          db,
			isFallback:  isFallback,
			memoryUsers: make(map[string]models.User),
			memoryPolls: make(map[string]models.Poll),
		}

		// Seed initial mock data that perfectly matches the reference design image
		mongoInstance.seedMockData()
	})
	return mongoInstance
}

// seedMockData seeds sample accounts and polls matching the screenshot
func (m *MongoService) seedMockData() {
	hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	userObjID := primitive.NewObjectID()
	defaultUser := models.User{
		ID:        userObjID,
		Email:     "tanushree@pulsevote.com",
		Password:  string(hashedPwd),
		Name:      "Tanushree",
		CreatedAt: time.Now().Add(-48 * time.Hour),
		UpdatedAt: time.Now(),
	}

	m.memoryUsers[defaultUser.Email] = defaultUser

	// Seed Poll matching Screen 5 & 6
	poll1ID, _ := primitive.ObjectIDFromHex("65f1a0b1c2d3e4f5a6b7c8d1")
	poll1 := models.Poll{
		ID:             poll1ID,
		CreatorID:      userObjID,
		CreatorName:    "Tanushree",
		Title:          "Which programming language do you love the most?",
		Description:    "Cast your vote and see results update in real-time.",
		AllowMultiple:  false,
		AllowAnonymous: true,
		IsActive:       true,
		TotalVotes:     511,
		CreatedAt:      time.Now().Add(-48 * time.Hour),
		UpdatedAt:      time.Now(),
		Options: []models.PollOption{
			{ID: "opt-py", Text: "Python", Votes: 216, IconName: "python", BadgeBg: "#10b981"},
			{ID: "opt-js", Text: "JavaScript", Votes: 132, IconName: "javascript", BadgeBg: "#f59e0b"},
			{ID: "opt-java", Text: "Java", Votes: 98, IconName: "java", BadgeBg: "#ef4444"},
			{ID: "opt-go", Text: "Go", Votes: 65, IconName: "go", BadgeBg: "#06b6d4"},
		},
	}
	m.memoryPolls[poll1.ID.Hex()] = poll1

	// Seed Poll 2
	poll2ID, _ := primitive.ObjectIDFromHex("65f1a0b1c2d3e4f5a6b7c8d2")
	poll2 := models.Poll{
		ID:             poll2ID,
		CreatorID:      userObjID,
		CreatorName:    "Tanushree",
		Title:          "Best tech trend in 2026?",
		Description:    "Autonomous AI Agents, WebAssembly, or Quantum Computing?",
		AllowMultiple:  false,
		AllowAnonymous: true,
		IsActive:       true,
		TotalVotes:     189,
		CreatedAt:      time.Now().Add(-96 * time.Hour),
		UpdatedAt:      time.Now(),
		Options: []models.PollOption{
			{ID: "opt-ai", Text: "Autonomous AI Agents", Votes: 110},
			{ID: "opt-wasm", Text: "WebAssembly Edge", Votes: 45},
			{ID: "opt-quantum", Text: "Quantum Computing", Votes: 34},
		},
	}
	m.memoryPolls[poll2.ID.Hex()] = poll2

	// Seed Poll 3 (Closed)
	poll3ID, _ := primitive.ObjectIDFromHex("65f1a0b1c2d3e4f5a6b7c8d3")
	poll3 := models.Poll{
		ID:             poll3ID,
		CreatorID:      userObjID,
		CreatorName:    "Tanushree",
		Title:          "Which is better for learning?",
		Description:    "Video tutorials or building projects from scratch?",
		AllowMultiple:  false,
		AllowAnonymous: true,
		IsActive:       false,
		TotalVotes:     320,
		CreatedAt:      time.Now().Add(-168 * time.Hour),
		UpdatedAt:      time.Now(),
		Options: []models.PollOption{
			{ID: "opt-build", Text: "Building Projects Directly", Votes: 240},
			{ID: "opt-video", Text: "Watching Video Courses", Votes: 80},
		},
	}
	m.memoryPolls[poll3.ID.Hex()] = poll3

	// Prime Redis with initial scores
	redisSvc := InitRedis()
	ctx := context.Background()
	_ = redisSvc.InitializePollZSet(ctx, poll1.ID.Hex(), poll1.Options)
	_ = redisSvc.InitializePollZSet(ctx, poll2.ID.Hex(), poll2.Options)
	_ = redisSvc.InitializePollZSet(ctx, poll3.ID.Hex(), poll3.Options)
}

// User Operations
func (m *MongoService) CreateUser(ctx context.Context, user models.User) (models.User, error) {
	if m.isFallback {
		m.mu.Lock()
		defer m.mu.Unlock()
		if _, exists := m.memoryUsers[user.Email]; exists {
			return models.User{}, fmt.Errorf("user with email %s already exists", user.Email)
		}
		if user.ID.IsZero() {
			user.ID = primitive.NewObjectID()
		}
		m.memoryUsers[user.Email] = user
		return user, nil
	}

	coll := m.db.Collection("users")
	var existing models.User
	err := coll.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existing)
	if err == nil {
		return models.User{}, fmt.Errorf("user with email %s already exists", user.Email)
	}

	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	_, err = coll.InsertOne(ctx, user)
	if err != nil {
		return models.User{}, fmt.Errorf("failed to insert user: %w", err)
	}
	return user, nil
}

func (m *MongoService) FindUserByEmail(ctx context.Context, email string) (models.User, error) {
	if m.isFallback {
		m.mu.RLock()
		defer m.mu.RUnlock()
		user, exists := m.memoryUsers[email]
		if !exists {
			return models.User{}, fmt.Errorf("user not found")
		}
		return user, nil
	}

	coll := m.db.Collection("users")
	var user models.User
	err := coll.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return models.User{}, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

func (m *MongoService) FindUserByID(ctx context.Context, id primitive.ObjectID) (models.User, error) {
	if m.isFallback {
		m.mu.RLock()
		defer m.mu.RUnlock()
		for _, u := range m.memoryUsers {
			if u.ID == id {
				return u, nil
			}
		}
		return models.User{}, fmt.Errorf("user not found")
	}

	coll := m.db.Collection("users")
	var user models.User
	err := coll.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return models.User{}, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

// Poll Operations
func (m *MongoService) CreatePoll(ctx context.Context, poll models.Poll) (models.Poll, error) {
	if poll.ID.IsZero() {
		poll.ID = primitive.NewObjectID()
	}
	poll.CreatedAt = time.Now()
	poll.UpdatedAt = time.Now()
	poll.IsActive = true

	if m.isFallback {
		m.mu.Lock()
		m.memoryPolls[poll.ID.Hex()] = poll
		m.mu.Unlock()
		return poll, nil
	}

	coll := m.db.Collection("polls")
	_, err := coll.InsertOne(ctx, poll)
	if err != nil {
		return models.Poll{}, fmt.Errorf("failed inserting poll: %w", err)
	}
	return poll, nil
}

func (m *MongoService) GetPollByID(ctx context.Context, idStr string) (models.Poll, error) {
	if m.isFallback {
		m.mu.RLock()
		defer m.mu.RUnlock()
		poll, exists := m.memoryPolls[idStr]
		if !exists {
			return models.Poll{}, fmt.Errorf("poll not found")
		}
		return poll, nil
	}

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		return models.Poll{}, fmt.Errorf("invalid poll ID format")
	}

	coll := m.db.Collection("polls")
	var poll models.Poll
	err = coll.FindOne(ctx, bson.M{"_id": objID}).Decode(&poll)
	if err != nil {
		return models.Poll{}, fmt.Errorf("poll not found: %w", err)
	}
	return poll, nil
}

func (m *MongoService) ListRecentPolls(ctx context.Context, limit int64) ([]models.Poll, error) {
	if m.isFallback {
		m.mu.RLock()
		defer m.mu.RUnlock()
		var list []models.Poll
		for _, p := range m.memoryPolls {
			list = append(list, p)
		}
		return list, nil
	}

	coll := m.db.Collection("polls")
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(limit)
	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}
	return polls, nil
}

func (m *MongoService) ListUserPolls(ctx context.Context, creatorID primitive.ObjectID) ([]models.Poll, error) {
	if m.isFallback {
		m.mu.RLock()
		defer m.mu.RUnlock()
		var list []models.Poll
		for _, p := range m.memoryPolls {
			list = append(list, p)
		}
		return list, nil
	}

	coll := m.db.Collection("polls")
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := coll.Find(ctx, bson.M{"creator_id": creatorID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}
	return polls, nil
}

// SyncZSetToMongo writes current Redis ZSET counts into MongoDB
func (m *MongoService) SyncZSetToMongo(ctx context.Context, pollID string, optionVotes map[string]int64) error {
	var total int64
	for _, v := range optionVotes {
		total += v
	}

	if m.isFallback {
		m.mu.Lock()
		defer m.mu.Unlock()
		if poll, ok := m.memoryPolls[pollID]; ok {
			for i := range poll.Options {
				if v, exists := optionVotes[poll.Options[i].ID]; exists {
					poll.Options[i].Votes = v
				}
			}
			poll.TotalVotes = total
			poll.UpdatedAt = time.Now()
			m.memoryPolls[pollID] = poll
		}
		return nil
	}

	objID, err := primitive.ObjectIDFromHex(pollID)
	if err != nil {
		return err
	}

	coll := m.db.Collection("polls")
	for optID, votes := range optionVotes {
		filter := bson.M{"_id": objID, "options.id": optID}
		update := bson.M{
			"$set": bson.M{
				"options.$.votes": votes,
				"total_votes":     total,
				"updated_at":      time.Now(),
			},
		}
		_, _ = coll.UpdateOne(ctx, filter, update)
	}

	return nil
}

// StartPeriodicSyncWorker runs a Go goroutine that periodically syncs Redis ZSET vote tallies
// to MongoDB every 10 seconds.
//
// WHY THIS ARCHITECTURE:
// 1. Redis serves real-time reads & writes at sub-millisecond latency.
// 2. MongoDB receives batched updates asynchronously every 10s, preventing write bottlenecks.
// 3. If Redis restarts or drops cache, MongoDB holds cold persistent history.
func (m *MongoService) StartPeriodicSyncWorker(redisSvc *RedisService, interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		log.Printf("[Sync Worker] Started Redis ZSET -> MongoDB sync worker (Interval: %v)", interval)

		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			polls, err := m.ListRecentPolls(ctx, 50)
			if err != nil {
				cancel()
				continue
			}

			for _, p := range polls {
				if !p.IsActive {
					continue
				}
				scores, err := redisSvc.GetOptionVotes(ctx, p.ID.Hex())
				if err == nil && len(scores) > 0 {
					_ = m.SyncZSetToMongo(ctx, p.ID.Hex(), scores)
				}
			}
			cancel()
		}
	}()
}
