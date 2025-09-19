package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/amkx1/Traceherb-Techies/chaincode/utils"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// LabContract for testing labs
type LabContract struct {
	contractapi.Contract
}

// AddQualityTest - labs append test results for a batch
func (lc *LabContract) AddQualityTest(ctx contractapi.TransactionContextInterface,
	id, batchID, resultsJson, timestamp, certificate string) (*models.QualityTestEvent, error) {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get client ID: %v", err)
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get MSP: %v", err)
	}
	if msp != "LabMSP" && msp != "TestingLabMSP" {
		return nil, fmt.Errorf("access denied: only LabMSP/TestingLabMSP can add quality tests")
	}

	cKey := "CollectionEvent:" + batchID
	cbz, err := ctx.GetStub().GetState(cKey)
	if err != nil || cbz == nil {
		return nil, fmt.Errorf("batch %s not found (collection event required)", batchID)
	}

	// parse results JSON
	var results map[string]interface{}
	if err := json.Unmarshal([]byte(resultsJson), &results); err != nil {
		return nil, fmt.Errorf("invalid results JSON: %v", err)
	}
	if err := utils.ValidateQuality(results); err != nil {
		return nil, fmt.Errorf("quality validation failed: %v", err)
	}

	// prevent duplicate test id
	key := "QualityTestEvent:" + id
	existing, _ := ctx.GetStub().GetState(key)
	if existing != nil {
		return nil, fmt.Errorf("quality test %s already exists", id)
	}

	// prevent same lab submitting multiple tests for same batch
	existingBzs, _ := utils.GetFromBatchIndex(ctx, batchID)
	for _, eb := range existingBzs {
		var qt models.QualityTestEvent
		_ = json.Unmarshal(eb, &qt)
		if qt.LabID == clientID {
			return nil, fmt.Errorf("lab %s has already submitted a test for batch %s", clientID, batchID)
		}
	}

	event := &models.QualityTestEvent{
		ResourceType: "QualityTestEvent",
		ID:           id,
		LabID:        clientID,
		BatchID:      batchID,
		Results:      results,
		Timestamp:    timestamp,
		Certificate:  certificate,
	}

	bz, _ := json.Marshal(event)
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return nil, fmt.Errorf("failed to store quality test: %v", err)
	}

	// store in batch index (include prefix in key)
	if err := utils.AddToBatchIndex(ctx, batchID, key); err != nil {
		return nil, fmt.Errorf("failed to add quality test to batch index: %v", err)
	}

	if err := utils.EmitEvent(ctx, "QualityTestAdded", bz); err != nil {
		fmt.Printf("warning: failed to emit event: %v\n", err)
	}

	return event, nil
}

// ReadQualityTest returns a quality test by id
func (lc *LabContract) ReadQualityTest(ctx contractapi.TransactionContextInterface, id string) (*models.QualityTestEvent, error) {
	key := "QualityTestEvent:" + id
	bz, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read quality test: %v", err)
	}
	if bz == nil {
		return nil, fmt.Errorf("quality test %s does not exist", id)
	}

	var qt models.QualityTestEvent
	if err := json.Unmarshal(bz, &qt); err != nil {
		return nil, fmt.Errorf("failed to unmarshal quality test: %v", err)
	}
	return &qt, nil
}

// GetTestsByBatch returns all QualityTestEvent entries for a batch
func (lc *LabContract) GetTestsByBatch(ctx contractapi.TransactionContextInterface, batchID string) ([]*models.QualityTestEvent, error) {
	bzs, err := utils.GetFromBatchIndex(ctx, batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to query quality tests for batch: %v", err)
	}

	tests := []*models.QualityTestEvent{}
	for _, bz := range bzs {
		var qt models.QualityTestEvent
		if err := json.Unmarshal(bz, &qt); err == nil {
			tests = append(tests, &qt)
		}
	}
	return tests, nil
}
