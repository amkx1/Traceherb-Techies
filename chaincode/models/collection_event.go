package models

// CollectionEvent represents a raw herb collection
type CollectionEvent struct {
	ResourceType string                 `json:"resourceType"`
	ID           string                 `json:"id"`
	CollectorID  string                 `json:"collectorId"`
	ActorType    string                 `json:"actorType"` // farmer | wild_collector
	Species      string                 `json:"species"`
	CommonName   string                 `json:"commonName,omitempty"`
	QuantityKg   float64                `json:"quantityKg,omitempty"`
	Location     map[string]float64     `json:"location,omitempty"` // {"lat": , "lon": }
	Timestamp    string                 `json:"timestamp"`
	InitialQual  map[string]interface{} `json:"initialQuality,omitempty"`
	Notes        string                 `json:"notes,omitempty"`
	BatchID      string                 `json:"batchId,omitempty"` // optional link to a batch
}
