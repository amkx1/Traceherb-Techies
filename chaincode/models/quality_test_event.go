package models

type QualityTestEvent struct {
	ResourceType string                 `json:"resourceType"`
	ID           string                 `json:"id"`
	LabID        string                 `json:"labId"`
	BatchID      string                 `json:"batchId"`
	Results      map[string]interface{} `json:"results"`
	Timestamp    string                 `json:"timestamp"`
	Certificate  string                 `json:"certificateUrl,omitempty"`
}
