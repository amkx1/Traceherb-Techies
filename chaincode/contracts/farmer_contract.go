package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/amkx1/Traceherb-Techies/chaincode/utils"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// FarmerContract handles farmer/cooperative actions
type FarmerContract struct {
	contractapi.Contract
}

// CreateCollectionEvent - farmer creates a collection event; id acts as batch id downstream
func (fc *FarmerContract) CreateCollectionEvent(ctx contractapi.TransactionContextInterface,
	id, species, location, timestamp, quality string) error {

	// identity & org check
	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return err
	}
	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return err
	}
	if msp != "FarmerMSP" && msp != "FarmerCoopMSP" {
		return fmt.Errorf("access denied: only FarmerMSP/FarmerCoopMSP can create collection events")
	}

	// validation rules
	if err := utils.ValidateGeoFence(location); err != nil {
		return fmt.Errorf("geo-fence validation failed: %v", err)
	}
	if err := utils.ValidateSeason(species, timestamp); err != nil {
		return fmt.Errorf("season validation failed: %v", err)
	}
	if err := utils.ValidateConservation(species); err != nil {
		return fmt.Errorf("conservation validation failed: %v", err)
	}

	// ensure not exists
	key := "CollectionEvent:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return fmt.Errorf("failed to read ledger: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("collection event with id %s already exists", id)
	}

	event := models.CollectionEvent{
		ID:        id,
		Species:   species,
		Location:  location,
		Collector: clientID,
		Org:       msp,
		Timestamp: timestamp,
		Quality:   quality,
	}

	bz, err := json.Marshal(event)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return err
	}

	// add to batch index
	if err := utils.AddToBatchIndex(ctx, id, key); err != nil {
		return fmt.Errorf("failed to index collection event: %v", err)
	}

	// emit event
	if err := utils.EmitEvent(ctx, "CollectionEventCreated", bz); err != nil {
		// non-fatal: log event but do not rollback
		return fmt.Errorf("created collection but failed to emit event: %v", err)
	}

	return nil
}

// ReadCollectionEvent
func (fc *FarmerContract) ReadCollectionEvent(ctx contractapi.TransactionContextInterface, id string) (*models.CollectionEvent, error) {
	key := "CollectionEvent:" + id
	bz, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read state: %v", err)
	}
	if bz == nil {
		return nil, fmt.Errorf("collection event %s does not exist", id)
	}
	var ev models.CollectionEvent
	if err := json.Unmarshal(bz, &ev); err != nil {
		return nil, err
	}
	return &ev, nil
}
