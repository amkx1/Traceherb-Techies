package models

type QualityTestEvent struct {
	ID        string `json:"id"`
	BatchID   string `json:"batch_id"`
	Lab       string `json:"lab"`
	Org       string `json:"org"`
	Results   string `json:"results"`
	Timestamp string `json:"timestamp"`
}
