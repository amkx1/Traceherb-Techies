package models

type ProcessingStep struct {
	ResourceType string                 `json:"resourceType,omitempty"`
	ID           string                 `json:"id"`
	BatchID      string                 `json:"batchId"`
	FacilityID   string                 `json:"facilityId,omitempty"` // Who performed the step
	Org          string                 `json:"org,omitempty"`        // MSP org
	Action       string                 `json:"action"`               // wash, dry, grind, etc
	Params       map[string]interface{} `json:"params,omitempty"`     // optional processing parameters
	Timestamp    string                 `json:"timestamp"`            // step timestamp
	Notes        string                 `json:"notes,omitempty"`      // optional notes
}
