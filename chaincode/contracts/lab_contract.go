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
	id, batchID, results, timestamp string) error {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return err
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return err
	}
	if msp != "LabMSP" && msp != "TestingLabMSP" {
		return fmt.Errorf("access denied: only LabMSP can add quality tests")
	}

	// verify batch exists
	cKey := "CollectionEvent:" + batchID
	cbz, err := ctx.GetStub().GetState(cKey)
	if err != nil {
		return fmt.Errorf("failed to read batch: %v", err)
	}
	if cbz == nil {
		return fmt.Errorf("batch %s not found (collection event required)", batchID)
	}

	// basic quality validation
	if err := utils.ValidateQuality(results); err != nil {
		return fmt.Errorf("quality validation failed: %v", err)
	}

	key := "QualityTestEvent:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("quality test %s already exists", id)
	}

	event := models.QualityTestEvent{
		ID:        id,
		BatchID:   batchID,
		Lab:       clientID,
		Org:       msp,
		Results:   results,
		Timestamp: timestamp,
	}

	bz, err := json.Marshal(event)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return err
	}

	// index it to batch
	if err := utils.AddToBatchIndex(ctx, batchID, key); err != nil {
		return err
	}

	if err := utils.EmitEvent(ctx, "QualityTestAdded", bz); err != nil {
		// continue even if event emits fails
	}

	return nil
}

// ReadQualityTest
func (lc *LabContract) ReadQualityTest(ctx contractapi.TransactionContextInterface, id string) (*models.QualityTestEvent, error) {
	key := "QualityTestEvent:" + id
	bz, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read quality test: %v", err)
	}
	if bz == nil {
		return nil, fmt.Errorf("quality test %s does not exist", id)
	}
	var ev models.QualityTestEvent
	if err := json.Unmarshal(bz, &ev); err != nil {
		return nil, err
	}
	return &ev, nil
}
