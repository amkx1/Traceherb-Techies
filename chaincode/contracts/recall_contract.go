package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// RecallContract defines the contract for managing recalls
type RecallContract struct {
	contractapi.Contract
}

// Recall defines the structure for a recall event
type Recall struct {
	RecallID string   `json:"recallId"`
	BatchIDs []string `json:"batchIds"`
	Reason   string   `json:"reason"`
	IssuedBy string   `json:"issuedBy"`
	IssuedAt string   `json:"issuedAt"`
}

// CreateRecall adds a new recall to the ledger.
// The backend sends a single JSON string representing the recall object.
func (rc *RecallContract) CreateRecall(ctx contractapi.TransactionContextInterface, recallJSON string) error {
	var recall Recall
	err := json.Unmarshal([]byte(recallJSON), &recall)
	if err != nil {
		return fmt.Errorf("failed to unmarshal recall JSON: %v", err)
	}

	recallBytes, err := json.Marshal(recall)
	if err != nil {
		return fmt.Errorf("failed to marshal recall: %v", err)
	}

	return ctx.GetStub().PutState(recall.RecallID, recallBytes)
}

// GetRecall retrieves a recall from the ledger by its ID.
func (rc *RecallContract) GetRecall(ctx contractapi.TransactionContextInterface, recallId string) (*Recall, error) {
	recallBytes, err := ctx.GetStub().GetState(recallId)
	if err != nil {
		return nil, fmt.Errorf("failed to read recall %s from world state: %v", recallId, err)
	}
	if recallBytes == nil {
		return nil, fmt.Errorf("recall %s does not exist", recallId)
	}

	var recall Recall
	err = json.Unmarshal(recallBytes, &recall)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal recall: %v", err)
	}

	return &recall, nil
}
