package main

// QualityTestEvent - created by Lab
type QualityTestEvent struct {
	ID        string `json:"id"`
	BatchID   string `json:"batch_id"` // links to CollectionEvent.ID
	Lab       string `json:"lab"`      // clientID
	Org       string `json:"org"`      // MSP id
	Results   string `json:"results"`  // JSON string {moisture:8, pesticide:PASS, dna: MATCH}
	Timestamp string `json:"timestamp"`
}
