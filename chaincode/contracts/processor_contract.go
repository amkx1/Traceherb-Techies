package contracts

import (
	"encoding/json"
	"fmt"

	"traceherb/chaincode/models"
	"traceherb/chaincode/utils"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ProcessorContract for processing facilities
type ProcessorContract struct {
	contractapi.Contract
}

// AddProcessingStep creates a processing step and emits an event
func (pc *ProcessorContract) AddProcessingStep(ctx contractapi.TransactionContextInterface,
	id, batchID, action, notes, timestamp string) (*models.ProcessingStep, error) {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get client ID: %v", err)
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get MSP: %v", err)
	}
	if msp != "ProcessorMSP" && msp != "ProcessingMSP" {
		return nil, fmt.Errorf("access denied: only ProcessorMSP can add processing steps")
	}

	// ensure batch exists
	cKey := "CollectionEvent:" + batchID
	cbz, err := ctx.GetStub().GetState(cKey)
	if err != nil {
		return nil, fmt.Errorf("failed to read batch: %v", err)
	}
	if cbz == nil {
		return nil, fmt.Errorf("batch %s not found", batchID)
	}

	// ensure step ID is unique
	key := "ProcessingStep:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing step: %v", err)
	}
	if existing != nil {
		return nil, fmt.Errorf("processing step %s already exists", id)
	}

	// create processing step
	step := models.ProcessingStep{
		ID:         id,
		BatchID:    batchID,
		FacilityID: clientID,
		Org:        msp,
		Action:     action,
		Notes:      notes,
		Timestamp:  timestamp,
	}

	bz, err := json.Marshal(step)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal processing step: %v", err)
	}
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return nil, fmt.Errorf("failed to put processing step: %v", err)
	}

	// index to batch
	if err := utils.AddToBatchIndex(ctx, batchID, key); err != nil {
		return nil, fmt.Errorf("failed to add step to batch index: %v", err)
	}

	// emit event for backend integration
	if err := utils.EmitEvent(ctx, "ProcessingStepAdded", bz); err != nil {
		fmt.Printf("warning: failed to emit ProcessingStepAdded event: %v\n", err)
	}

	return &step, nil
}
