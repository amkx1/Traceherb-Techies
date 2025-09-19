package models

type ProvenanceBundle struct {
	ResourceType     string             `json:"resourceType,omitempty"`
	BatchID          string             `json:"batchId"`
	CollectionEvents []CollectionEvent  `json:"collectionEvents,omitempty"`
	ProcessingSteps  []ProcessingStep   `json:"processingSteps,omitempty"`
	QualityTests     []QualityTestEvent `json:"qualityTests,omitempty"`
	FinalBatch       *FinalBatch        `json:"finalBatch,omitempty"`
}
