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

// helper: addToBatchIndex stores ordered list of keys for a given batchID
func addToBatchIndex(ctx contractapi.TransactionContextInterface, batchID string, key string) error {
	indexKey := "index:batch:" + batchID

	idxBytes, err := ctx.GetStub().GetState(indexKey)
	if err != nil {
		return err
	}

	var keys []string
	if idxBytes != nil {
		if err := json.Unmarshal(idxBytes, &keys); err != nil {
			return err
		}
	}
	keys = append(keys, key)
	out, err := json.Marshal(keys)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(indexKey, out)
}

// GetHistoryForKey - returns history for a ledger key
func (pc *ProvenanceContract) GetHistoryForKey(ctx contractapi.TransactionContextInterface, key string) (string, error) {
	iter, err := ctx.GetStub().GetHistoryForKey(key)
	if err != nil {
		return "", fmt.Errorf("failed to get history: %v", err)
	}
	defer iter.Close()

	var history []map[string]interface{}
	for iter.HasNext() {
		mod, err := iter.Next()
		if err != nil {
			return "", err
		}
		entry := map[string]interface{}{
			"txId":      mod.GetTxId(),
			"timestamp": mod.GetTimestamp(),
			"isDelete":  mod.IsDelete,
			"value":     string(mod.Value),
		}
		history = append(history, entry)
	}
	bz, _ := json.Marshal(history)
	return string(bz), nil
}

// GetProvenanceBundle - assemble CollectionEvent + QualityTest + ProcessingSteps + FinalBatch
func (pc *ProvenanceContract) GetProvenanceBundle(ctx contractapi.TransactionContextInterface, batchID string) (*models.ProvenanceBundle, error) {
	bundle := &models.ProvenanceBundle{BatchID: batchID}

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
		return nil, err
	}

	var processingSteps []*models.ProcessingStep
	for _, k := range keys {
		bz, err := ctx.GetStub().GetState(k)
		if err != nil {
			return nil, fmt.Errorf("failed to read key %s: %v", k, err)
		}
		if bz == nil {
			continue
		}

		switch {
		case len(k) > 16 && k[:16] == "CollectionEvent:":
			var ce models.CollectionEvent
			if err := json.Unmarshal(bz, &ce); err == nil {
				bundle.Collection = &ce
			}
		case len(k) > 17 && k[:17] == "QualityTestEvent:":
			var qt models.QualityTestEvent
			if err := json.Unmarshal(bz, &qt); err == nil {
				bundle.QualityTest = &qt
			}
		case len(k) > 15 && k[:15] == "ProcessingStep:":
			var ps models.ProcessingStep
			if err := json.Unmarshal(bz, &ps); err == nil {
				processingSteps = append(processingSteps, &ps)
			}
		case len(k) > 11 && k[:11] == "FinalBatch:":
			var fb models.FinalBatch
			if err := json.Unmarshal(bz, &fb); err == nil {
				bundle.FinalBatch = &fb
			}
		}
	}
	bundle.Processing = processingSteps
	return bundle, nil
}
