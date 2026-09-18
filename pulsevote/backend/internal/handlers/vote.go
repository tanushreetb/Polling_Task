package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"pulsevote/backend/internal/middleware"
	"pulsevote/backend/internal/models"
	"pulsevote/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type VoteHandler struct {
	mongoSvc *services.MongoService
	redisSvc *services.RedisService
}

func NewVoteHandler(mongoSvc *services.MongoService, redisSvc *services.RedisService) *VoteHandler {
	return &VoteHandler{
		mongoSvc: mongoSvc,
		redisSvc: redisSvc,
	}
}

// CastVote handles submitting votes to a poll
// POST /api/polls/:id/vote
//
// FLOW:
// 1. Validate payload with go-playground/validator.
// 2. Verify poll existence & active state in MongoDB.
// 3. Atomically increment Redis ZSET score: ZINCRBY poll:{id}:votes 1 {option_id}
// 4. Retrieve new tally and calculate percentages.
// 5. Publish LiveVoteEvent to Redis Pub/Sub: PUBLISH poll:{id}:events {payload}
// 6. Connected WebSocket clients receive the payload instantly with 0ms page refresh!
func (h *VoteHandler) CastVote(c *gin.Context) {
	pollID := c.Param("id")

	var input models.VoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.HandleValidationError(c, err)
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// 1. Fetch Poll metadata
	poll, err := h.mongoSvc.GetPollByID(ctx, pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if !poll.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "This poll is closed and no longer accepting votes"})
		return
	}

	// 2. Validate single vs multiple choice rule
	if !poll.AllowMultiple && len(input.OptionIDs) > 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This poll allows voting for only one option"})
		return
	}

	// Validate that submitted option IDs actually exist on this poll
	validOptMap := make(map[string]models.PollOption)
	for _, opt := range poll.Options {
		validOptMap[opt.ID] = opt
	}

	for _, selectedID := range input.OptionIDs {
		if _, ok := validOptMap[selectedID]; !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid option ID: %s", selectedID)})
			return
		}
	}

	// Determine voter identifier (user ID or client IP + user agent hash)
	voterID := c.GetString("user_id")
	if voterID == "" {
		voterID = fmt.Sprintf("guest:%s:%s", c.ClientIP(), c.GetHeader("User-Agent"))
	}

	// 3. Record vote in Redis ZSET (ZINCRBY)
	var lastVotedOpt string
	for _, optID := range input.OptionIDs {
		_, err := h.redisSvc.RecordVote(ctx, pollID, optID, voterID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register vote in Redis"})
			return
		}
		lastVotedOpt = optID
	}

	// 4. Retrieve fresh scores from Redis ZSET
	scores, err := h.redisSvc.GetOptionVotes(ctx, pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read updated scores"})
		return
	}

	// Calculate totals and percentages
	var totalVotes int64
	for _, v := range scores {
		totalVotes += v
	}

	optionScores := make([]models.OptionScore, len(poll.Options))
	for i, opt := range poll.Options {
		votes := scores[opt.ID]
		pct := 0.0
		if totalVotes > 0 {
			pct = (float64(votes) / float64(totalVotes)) * 100.0
		}
		optionScores[i] = models.OptionScore{
			OptionID:   opt.ID,
			Text:       opt.Text,
			IconName:   opt.IconName,
			Votes:      votes,
			Percentage: pct,
		}
	}

	// 5. Broadcast to all clients over Redis Pub/Sub
	event := models.LiveVoteEvent{
		PollID:       pollID,
		TotalVotes:   totalVotes,
		Options:      optionScores,
		VoterNick:    input.Nickname,
		LastOptionID: lastVotedOpt,
		Timestamp:    time.Now(),
	}

	_ = h.redisSvc.PublishVoteEvent(ctx, event)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Vote recorded successfully",
		"poll_id":     pollID,
		"total_votes": totalVotes,
		"options":     optionScores,
	})
}

// GetLiveResults returns instant live standings from Redis ZSET
// GET /api/polls/:id/results
func (h *VoteHandler) GetLiveResults(c *gin.Context) {
	pollID := c.Param("id")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	poll, err := h.mongoSvc.GetPollByID(ctx, pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	scores, err := h.redisSvc.GetOptionVotes(ctx, pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Redis ZSET scores"})
		return
	}

	var totalVotes int64
	for _, v := range scores {
		totalVotes += v
	}

	optionScores := make([]models.OptionScore, len(poll.Options))
	for i, opt := range poll.Options {
		votes := scores[opt.ID]
		pct := 0.0
		if totalVotes > 0 {
			pct = (float64(votes) / float64(totalVotes)) * 100.0
		}
		optionScores[i] = models.OptionScore{
			OptionID:   opt.ID,
			Text:       opt.Text,
			IconName:   opt.IconName,
			Votes:      votes,
			Percentage: pct,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"poll_id":        poll.ID.Hex(),
		"title":          poll.Title,
		"description":    poll.Description,
		"total_votes":    totalVotes,
		"is_active":      poll.IsActive,
		"allow_multiple": poll.AllowMultiple,
		"options":        optionScores,
	})
}
