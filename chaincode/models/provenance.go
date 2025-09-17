package models

// import your other model types
import (
	"github.com/amkx1/Traceherb-Techies/chaincode/models"
)

// ProvenanceBundle - assembled consumer-facing payload (FHIR-like)
type ProvenanceBundle struct {
	BatchID     string                   `json:"batch_id"`
	Collection  *models.CollectionEvent  `json:"collection,omitempty"`
	QualityTest *models.QualityTestEvent `json:"quality_test,omitempty"`
	Processing  []*models.ProcessingStep `json:"processing,omitempty"`
	FinalBatch  *models.FinalBatch       `json:"final_batch,omitempty"`
}
