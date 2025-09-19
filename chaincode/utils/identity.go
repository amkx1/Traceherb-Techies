package utils

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// EmitEvent sends a chaincode event to Hyperledger Fabric
func EmitEvent(ctx contractapi.TransactionContextInterface, eventName string, payload []byte) error {
	if err := ctx.GetStub().SetEvent(eventName, payload); err != nil {
		return fmt.Errorf("failed to emit event %s: %v", eventName, err)
	}
	return nil
}

// AddToBatchIndex stores an ordered list of ledger keys for a given batchID
func AddToBatchIndex(ctx contractapi.TransactionContextInterface, batchID string, key string) error {
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

	// Append new key and save
	keys = append(keys, key)
	out, err := json.Marshal(keys)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(indexKey, out)
}

// GetFromBatchIndex fetches all ledger entries for a batchID
func GetFromBatchIndex(ctx contractapi.TransactionContextInterface, batchID string) ([][]byte, error) {
	indexKey := "index:batch:" + batchID
	idxBytes, err := ctx.GetStub().GetState(indexKey)
	if err != nil || idxBytes == nil {
		return nil, err
	}

	var keys []string
	if err := json.Unmarshal(idxBytes, &keys); err != nil {
		return nil, err
	}

	var results [][]byte
	for _, k := range keys {
		bz, err := ctx.GetStub().GetState(k)
		if err != nil || bz == nil {
			continue
		}
		results = append(results, bz)
	}
	return results, nil
}
