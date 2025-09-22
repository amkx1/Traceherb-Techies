package contracts

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"traceherb/chaincode/models"
	"traceherb/chaincode/utils"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ManufacturerContract - manufacturer finalizes batches and issues QR payload
type ManufacturerContract struct {
	contractapi.Contract
}

// FinalizeBatch: create final batch record, generate QR payload (hash-based), emit event
func (mc *ManufacturerContract) FinalizeBatch(ctx contractapi.TransactionContextInterface,
	id, batchID, timestamp string) (string, error) {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get client ID: %v", err)
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get MSP: %v", err)
	}
	if msp != "ManufacturerMSP" && msp != "ManufacturerOrgMSP" {
		return "", fmt.Errorf("access denied: only ManufacturerMSP can finalize batches")
	}

	// ensure collection exists
	ckey := "CollectionEvent:" + batchID
	cbz, err := ctx.GetStub().GetState(ckey)
	if err != nil {
		return "", fmt.Errorf("failed to read collection event: %v", err)
	}
	if cbz == nil {
		return "", fmt.Errorf("collection event %s not found", batchID)
	}

	// generate QR payload
	h := sha256.New()
	h.Write([]byte(batchID))
	h.Write([]byte(timestamp))
	h.Write([]byte(clientID))
	sum := h.Sum(nil)
	hash := hex.EncodeToString(sum)
	qrPayload := "traceher://batch/" + hash

	// ensure id not used
	key := "FinalBatch:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return "", fmt.Errorf("failed to check existing final batch: %v", err)
	}
	if existing != nil {
		return "", fmt.Errorf("final batch id %s already exists", id)
	}

	// create final batch
	fb := models.FinalBatch{
		ID:           id,
		BatchID:      batchID,
		Manufacturer: clientID,
		Org:          msp,
		QRPayload:    qrPayload,
		Timestamp:    timestamp,
	}

	bz, err := json.Marshal(fb)
	if err != nil {
		return "", fmt.Errorf("failed to marshal final batch: %v", err)
	}
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return "", fmt.Errorf("failed to put final batch state: %v", err)
	}

	// index to batch
	if err := utils.AddToBatchIndex(ctx, batchID, key); err != nil {
		return "", fmt.Errorf("failed to add to batch index: %v", err)
	}

	// emit event for off-chain integration
	eventPayload := map[string]string{
		"finalBatchID": id,
		"batchID":      batchID,
		"qr_payload":   qrPayload,
	}
	evbz, _ := json.Marshal(eventPayload)
	if err := utils.EmitEvent(ctx, "FinalBatchCreated", evbz); err != nil {
		fmt.Printf("warning: failed to emit event: %v\n", err)
	}

	return qrPayload, nil
}

// ReadFinalBatch
func (mc *ManufacturerContract) ReadFinalBatch(ctx contractapi.TransactionContextInterface, id string) (*models.FinalBatch, error) {
	key := "FinalBatch:" + id
	bz, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read final batch: %v", err)
	}
	if bz == nil {
		return nil, fmt.Errorf("final batch %s not found", id)
	}
	var fb models.FinalBatch
	if err := json.Unmarshal(bz, &fb); err != nil {
		return nil, fmt.Errorf("failed to unmarshal final batch: %v", err)
	}
	return &fb, nil
}

// ReadAllFinalBatches - convenience function for backend querying
func (mc *ManufacturerContract) ReadAllFinalBatches(ctx contractapi.TransactionContextInterface) ([]*models.FinalBatch, error) {
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("FinalBatch:", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get all final batches: %v", err)
	}
	defer resultsIterator.Close()

	var batches []*models.FinalBatch
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var fb models.FinalBatch
		if err := json.Unmarshal(queryResponse.Value, &fb); err != nil {
			return nil, err
		}
		batches = append(batches, &fb)
	}
	return batches, nil
}
