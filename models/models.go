package models

import (
	"encoding/json"
	"math"
)

// Collector/farmer profile
type Collector struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Org       string `json:"org"`
	Location  string `json:"location"` // optional
	CreatedAt string `json:"createdAt"`
}

// CollectionEvent represents a geo-tagged harvest event
type CollectionEvent struct {
	EventID     string             `json:"eventId"`
	CollectorID string             `json:"collectorId"`
	Species     string             `json:"species"`
	Latitude    float64            `json:"latitude"`
	Longitude   float64            `json:"longitude"`
	Quantity    float64            `json:"quantity"`
	Unit        string             `json:"unit"`
	Quality     map[string]float64 `json:"quality"`    // e.g., moisture, foreignMatter
	Timestamp   string             `json:"timestamp"`  // collector provided
	RecordedAt  string             `json:"recordedAt"` // ledger timestamp
}

// QualityTest represents lab results
type QualityTest struct {
	TestID    string                 `json:"testId"`
	BatchID   string                 `json:"batchId"`
	LabID     string                 `json:"labId"`
	TestType  string                 `json:"testType"`
	Results   map[string]interface{} `json:"results"`
	Timestamp string                 `json:"timestamp"`
}

// ProcessingStep for downstream processing
type ProcessingStep struct {
	StepID    string                 `json:"stepId"`
	BatchID   string                 `json:"batchId"`
	ActorID   string                 `json:"actorId"`
	StepType  string                 `json:"stepType"` // DRYING, GRINDING, STORAGE
	Metadata  map[string]interface{} `json:"metadata"`
	Timestamp string                 `json:"timestamp"`
}

// Validate initial quality metrics against simple thresholds
func ValidateInitialQuality(ev CollectionEvent) bool {
	// Example threshold: moisture must be <= 12%
	if val, ok := ev.Quality["moisture"]; ok {
		if val > 12.0+math.SmallestNonzeroFloat64 {
			return false
		}
	}
	// Add pesticide, DNA-sim checks via other attributes or off-chain verification
	return true
}

// helper to pretty-print
func ToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
