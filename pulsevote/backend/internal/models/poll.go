package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PollOption represents a single choice in a poll
type PollOption struct {
	ID        string `bson:"id" json:"id"`
	Text      string `bson:"text" json:"text"`
	Votes     int64  `bson:"votes" json:"votes"`
	IconName  string `bson:"icon_name,omitempty" json:"icon_name,omitempty"`   // e.g. "python", "javascript", "java", "go"
	BadgeBg   string `bson:"badge_bg,omitempty" json:"badge_bg,omitempty"`     // CSS accent color
}

// Poll represents a polling session stored persistently in MongoDB
type Poll struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CreatorID      primitive.ObjectID `bson:"creator_id" json:"creator_id"`
	CreatorName    string             `bson:"creator_name" json:"creator_name"`
	Title          string             `bson:"title" json:"title"`
	Description    string             `bson:"description" json:"description"`
	Options        []PollOption       `bson:"options" json:"options"`
	AllowMultiple  bool               `bson:"allow_multiple" json:"allow_multiple"`
	AllowAnonymous bool               `bson:"allow_anonymous" json:"allow_anonymous"`
	IsActive       bool               `bson:"is_active" json:"is_active"`
	TotalVotes     int64              `bson:"total_votes" json:"total_votes"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

// OptionInput validates each individual option in a poll creation request
type OptionInput struct {
	Text     string `json:"text" binding:"required,min=1,max=100"`
	IconName string `json:"icon_name"`
	BadgeBg  string `json:"badge_bg"`
}

// CreatePollInput strictly validates inbound poll creation requests
type CreatePollInput struct {
	Title          string        `json:"title" binding:"required,min=3,max=150"`
	Description    string        `json:"description" binding:"max=500"`
	Options        []OptionInput `json:"options" binding:"required,min=2,max=10,dive"`
	AllowMultiple  bool          `json:"allow_multiple"`
	AllowAnonymous bool          `json:"allow_anonymous"`
}

// VoteInput validates a vote submission
type VoteInput struct {
	OptionIDs []string `json:"option_ids" binding:"required,min=1"`
	Nickname  string   `json:"nickname" binding:"max=50"`
}

// OptionScore represents an option's score retrieved directly from Redis ZSET
type OptionScore struct {
	OptionID   string  `json:"option_id"`
	Text       string  `json:"text"`
	IconName   string  `json:"icon_name,omitempty"`
	Votes      int64   `json:"votes"`
	Percentage float64 `json:"percentage"`
}

// LiveVoteEvent is published to Redis Pub/Sub whenever a vote is registered
type LiveVoteEvent struct {
	PollID       string        `json:"poll_id"`
	TotalVotes   int64         `json:"total_votes"`
	Options      []OptionScore `json:"options"`
	VoterNick    string        `json:"voter_nick,omitempty"`
	LastOptionID string        `json:"last_option_id,omitempty"`
	Timestamp    time.Time     `json:"timestamp"`
}

// HostMetrics represents dashboard aggregates for the host user
type HostMetrics struct {
	TotalPolls   int64 `json:"total_polls"`
	ActivePolls  int64 `json:"active_polls"`
	TotalVotes   int64 `json:"total_votes"`
	UniqueVoters int64 `json:"unique_voters"`
}
