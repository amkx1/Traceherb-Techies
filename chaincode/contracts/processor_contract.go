package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/amkx1/Traceherb-Techies/chaincode/utils"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ProcessorContract for processing facilities
type ProcessorContract struct {
	contractapi.Contract
}

func (pc *ProcessorContract) AddProcessingStep(ctx contractapi.TransactionContextInterface,
	id, batchID, action, notes, timestamp string) error {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return err
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return err
	}
	if msp != "ProcessorMSP" && msp != "ProcessingMSP" {
		return fmt.Errorf("access denied: only ProcessorMSP can add processing steps")
	}

	// ensure batch exists
	cKey := "CollectionEvent:" + batchID
	cbz, err := ctx.GetStub().GetState(cKey)
	if err != nil {
		return fmt.Errorf("failed to read batch: %v", err)
	}
	if cbz == nil {
		return fmt.Errorf("batch %s not found", batchID)
	}

	key := "ProcessingStep:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("processing step %s already exists", id)
	}

	step := models.ProcessingStep{
		ID:        id,
		BatchID:   batchID,
		Facility:  clientID,
		Org:       msp,
		Action:    action,
		Notes:     notes,
		Timestamp: timestamp,
	}

	bz, err := json.Marshal(step)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return err
	}

	if err := utils.AddToBatchIndex(ctx, batchID, key); err != nil {
		return err
	}

	if err := utils.EmitEvent(ctx, "ProcessingStepAdded", bz); err != nil {
		// ignore event failure
	}

	return nil
}
