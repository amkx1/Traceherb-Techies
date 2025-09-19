package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ProvenanceContract - assemble provenance bundles and provide history
type ProvenanceContract struct {
	contractapi.Contract
}

// GetProvenanceBundle - assemble all ledger events for a batch
func (pc *ProvenanceContract) GetProvenanceBundle(ctx contractapi.TransactionContextInterface, batchID string) (*models.ProvenanceBundle, error) {
	bundle := &models.ProvenanceBundle{
		BatchID:          batchID,
		CollectionEvents: []models.CollectionEvent{},
		ProcessingSteps:  []models.ProcessingStep{},
		QualityTests:     []models.QualityTestEvent{},
	}

	indexKey := "index:batch:" + batchID
	idxBytes, err := ctx.GetStub().GetState(indexKey)
	if err != nil {
		return nil, fmt.Errorf("failed to read batch index: %v", err)
	}
	if idxBytes == nil {
		return bundle, fmt.Errorf("no ledger events found for batch %s", batchID)
	}

	var keys []string
	if err := json.Unmarshal(idxBytes, &keys); err != nil {
		return nil, fmt.Errorf("failed to parse batch index: %v", err)
	}

	for _, k := range keys {
		bz, err := ctx.GetStub().GetState(k)
		if err != nil || bz == nil {
			continue
		}

		switch {
		case len(k) > 16 && k[:16] == "CollectionEvent:":
			var ce models.CollectionEvent
			if err := json.Unmarshal(bz, &ce); err == nil {
				bundle.CollectionEvents = append(bundle.CollectionEvents, ce)
			}
		case len(k) > 17 && k[:17] == "QualityTestEvent:":
			var qt models.QualityTestEvent
			if err := json.Unmarshal(bz, &qt); err == nil {
				bundle.QualityTests = append(bundle.QualityTests, qt)
			}
		case len(k) > 15 && k[:15] == "ProcessingStep:":
			var ps models.ProcessingStep
			if err := json.Unmarshal(bz, &ps); err == nil {
				bundle.ProcessingSteps = append(bundle.ProcessingSteps, ps)
			}
		case len(k) > 11 && k[:11] == "FinalBatch:":
			var fb models.FinalBatch
			if err := json.Unmarshal(bz, &fb); err == nil {
				bundle.FinalBatch = &fb
			}
		}
	}

	return bundle, nil
}
