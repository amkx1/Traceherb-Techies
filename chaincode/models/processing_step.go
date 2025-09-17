package models

// ProcessingStep - created by Processor
type ProcessingStep struct {
	ID        string `json:"id"`
	BatchID   string `json:"batch_id"`
	Facility  string `json:"facility"` // clientID
	Org       string `json:"org"`
	Action    string `json:"action"` // drying, grinding, storage
	Notes     string `json:"notes"`
	Timestamp string `json:"timestamp"`
}
