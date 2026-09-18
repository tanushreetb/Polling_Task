package services

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"pulsevote/backend/internal/models"

	"github.com/redis/go-redis/v9"
)

// loadEnvFile reads a .env file and sets environment variables if not already set
func loadEnvFile() {
	envFiles := []string{".env", "../.env", "../../.env"}
	for _, envFile := range envFiles {
		f, err := os.Open(envFile)
		if err != nil {
			continue
		}
		defer f.Close()
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.Trim(strings.TrimSpace(parts[1]), "\"'")
				if os.Getenv(key) == "" {
					os.Setenv(key, val)
				}
			}
		}
		break
	}
}

// RedisService encapsulates Redis operations for Sorted Sets (ZSET) and Pub/Sub
type RedisService struct {
	client     *redis.Client
	isFallback bool
	// In-memory fallback if Redis is not reachable locally
	mu             sync.RWMutex
	memoryZSets    map[string]map[string]float64
	memoryPubSub   map[string][]chan string
	memoryVoters   map[string]map[string]bool
}

var (
	redisInstance *RedisService
	redisOnce     sync.Once
)

// InitRedis initializes the Redis client or sets up an in-memory replica if Redis is offline
func InitRedis() *RedisService {
	redisOnce.Do(func() {
		loadEnvFile()
		redisAddr := os.Getenv("REDIS_ADDR")
		if redisAddr == "" {
			redisAddr = "localhost:6379"
		}

		redisPassword := os.Getenv("REDIS_PASSWORD")

		opt, err := redis.ParseURL(redisAddr)
		var rdb *redis.Client
		if err == nil {
			rdb = redis.NewClient(opt)
		} else {
			rdb = redis.NewClient(&redis.Options{
				Addr:     redisAddr,
				Password: redisPassword,
				DB:       0,
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second)
		defer cancel()

		pong, pingErr := rdb.Ping(ctx).Result()
		if pingErr != nil {
			log.Printf("[Redis] Warning: Redis connection failed at %s (%v). Activating high-performance in-memory simulation engine for development.", redisAddr, pingErr)
			redisInstance = &RedisService{
				client:       nil,
				isFallback:   true,
				memoryZSets:  make(map[string]map[string]float64),
				memoryPubSub: make(map[string][]chan string),
				memoryVoters: make(map[string]map[string]bool),
			}
		} else {
			log.Printf("[Redis] Connected successfully to Redis: %s (PONG: %s)", redisAddr, pong)
			redisInstance = &RedisService{
				client:       rdb,
				isFallback:   false,
				memoryZSets:  make(map[string]map[string]float64),
				memoryPubSub: make(map[string][]chan string),
				memoryVoters: make(map[string]map[string]bool),
			}
		}
	})
	return redisInstance
}

// GetRedisKey returns standard Redis key formatting for poll votes
func GetPollZSetKey(pollID string) string {
	return fmt.Sprintf("poll:%s:votes", pollID)
}

// GetPollChannel returns the Redis Pub/Sub channel name for broadcasting live events
func GetPollChannel(pollID string) string {
	return fmt.Sprintf("poll:%s:events", pollID)
}

// RecordVote increments the option's vote tally in Redis ZSET:
// Redis Command: ZINCRBY poll:{id}:votes 1 {option_id}
//
// WHY REDIS ZSET:
// 1. O(log N) atomic increment ensures instant consistency even during thousands of concurrent votes.
// 2. Avoids MongoDB document lock contention and write amplification.
// 3. Built-in instant sorted ranking (leaderboard) via ZREVRANGEBYSCORE.
func (s *RedisService) RecordVote(ctx context.Context, pollID, optionID, voterID string) (float64, error) {
	if s.isFallback {
		s.mu.Lock()
		defer s.mu.Unlock()

		key := GetPollZSetKey(pollID)
		if s.memoryZSets[key] == nil {
			s.memoryZSets[key] = make(map[string]float64)
		}
		s.memoryZSets[key][optionID]++
		newScore := s.memoryZSets[key][optionID]

		// Record unique voter
		voterKey := fmt.Sprintf("poll:%s:voters", pollID)
		if s.memoryVoters[voterKey] == nil {
			s.memoryVoters[voterKey] = make(map[string]bool)
		}
		s.memoryVoters[voterKey][voterID] = true

		return newScore, nil
	}

	key := GetPollZSetKey(pollID)
	// Atomic increment via ZINCRBY
	newScore, err := s.client.ZIncrBy(ctx, key, 1, optionID).Result()
	if err != nil {
		return 0, fmt.Errorf("redis ZIncrBy failed: %w", err)
	}

	// Track unique voter set
	voterKey := fmt.Sprintf("poll:%s:voters", pollID)
	_ = s.client.SAdd(ctx, voterKey, voterID).Err()

	return newScore, nil
}

// GetOptionVotes retrieves current scores for all options of a poll from ZSET
func (s *RedisService) GetOptionVotes(ctx context.Context, pollID string) (map[string]int64, error) {
	results := make(map[string]int64)

	if s.isFallback {
		s.mu.RLock()
		defer s.mu.RUnlock()
		key := GetPollZSetKey(pollID)
		if set, ok := s.memoryZSets[key]; ok {
			for optID, score := range set {
				results[optID] = int64(score)
			}
		}
		return results, nil
	}

	key := GetPollZSetKey(pollID)
	// Query all members with scores ordered from highest to lowest
	zEntries, err := s.client.ZRevRangeWithScores(ctx, key, 0, -1).Result()
	if err != nil && err != redis.Nil {
		return nil, fmt.Errorf("failed fetching ZSET scores: %w", err)
	}

	for _, entry := range zEntries {
		if optStr, ok := entry.Member.(string); ok {
			results[optStr] = int64(entry.Score)
		}
	}

	return results, nil
}

// InitializePollZSet primes the Redis ZSET with all valid options at score 0
func (s *RedisService) InitializePollZSet(ctx context.Context, pollID string, options []models.PollOption) error {
	if s.isFallback {
		s.mu.Lock()
		defer s.mu.Unlock()
		key := GetPollZSetKey(pollID)
		s.memoryZSets[key] = make(map[string]float64)
		for _, opt := range options {
			s.memoryZSets[key][opt.ID] = float64(opt.Votes)
		}
		return nil
	}

	key := GetPollZSetKey(pollID)
	var members []redis.Z
	for _, opt := range options {
		members = append(members, redis.Z{
			Score:  float64(opt.Votes),
			Member: opt.ID,
		})
	}

	if len(members) > 0 {
		return s.client.ZAdd(ctx, key, members...).Err()
	}
	return nil
}

// PublishVoteEvent sends live payload to Redis Pub/Sub channel
//
// WHY REDIS PUB/SUB:
// 1. Decouples the voting HTTP handler from the WebSocket broadcasting layer.
// 2. Horizontally scalable: across multiple Go server instances, any instance's
//    WebSocket clients will receive the broadcast instantly.
func (s *RedisService) PublishVoteEvent(ctx context.Context, event models.LiveVoteEvent) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("marshal live vote event failed: %w", err)
	}

	channel := GetPollChannel(event.PollID)

	if s.isFallback {
		s.mu.RLock()
		defer s.mu.RUnlock()
		if subs, exists := s.memoryPubSub[channel]; exists {
			for _, ch := range subs {
				select {
				case ch <- string(payload):
				default:
					// Avoid blocking if subscriber is slow
				}
			}
		}
		return nil
	}

	return s.client.Publish(ctx, channel, payload).Err()
}

// Subscribe returns a channel that yields raw JSON event messages from Redis Pub/Sub
func (s *RedisService) Subscribe(ctx context.Context, pollID string) (<-chan string, func(), error) {
	channelName := GetPollChannel(pollID)
	out := make(chan string, 100)

	if s.isFallback {
		s.mu.Lock()
		ch := make(chan string, 50)
		s.memoryPubSub[channelName] = append(s.memoryPubSub[channelName], ch)
		s.mu.Unlock()

		go func() {
			for {
				select {
				case <-ctx.Done():
					return
				case msg, ok := <-ch:
					if !ok {
						return
					}
					out <- msg
				}
			}
		}()

		cleanup := func() {
			s.mu.Lock()
			defer s.mu.Unlock()
			subs := s.memoryPubSub[channelName]
			for i, subscriber := range subs {
				if subscriber == ch {
					s.memoryPubSub[channelName] = append(subs[:i], subs[i+1:]...)
					close(ch)
					break
				}
			}
		}

		return out, cleanup, nil
	}

	pubsub := s.client.Subscribe(ctx, channelName)
	ch := pubsub.Channel()

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				out <- msg.Payload
			}
		}
	}()

	cleanup := func() {
		_ = pubsub.Close()
	}

	return out, cleanup, nil
}
