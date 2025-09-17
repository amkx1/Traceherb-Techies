package models

type ProvenanceBundle struct {
	BatchID     string            `json:"batch_id"`
	Collection  *CollectionEvent  `json:"collection,omitempty"`
	QualityTest *QualityTestEvent `json:"quality_test,omitempty"`
	Processing  []*ProcessingStep `json:"processing,omitempty"`
	FinalBatch  *FinalBatch       `json:"final_batch,omitempty"`
}
