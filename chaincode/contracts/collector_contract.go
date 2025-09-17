package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/amkx1/Traceherb-Techies/chaincode/utils"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// CollectorContract for wild-collector groups
type CollectorContract struct {
	contractapi.Contract
}

func (cc *CollectorContract) CreateWildCollectionEvent(ctx contractapi.TransactionContextInterface,
	id, species, location, timestamp, quality string) error {

	clientID, err := utils.GetClientID(ctx)
	if err != nil {
		return err
	}

	msp, err := utils.GetClientMSP(ctx)
	if err != nil {
		return err
	}

	if msp != "CollectorMSP" && msp != "WildCollectorMSP" {
		return fmt.Errorf("access denied: only CollectorMSP can create wild collection events")
	}

	// Validations
	if err := utils.ValidateGeoFence(location); err != nil {
		return fmt.Errorf("geo-fence validation failed: %v", err)
	}
	if err := utils.ValidateSeason(species, timestamp); err != nil {
		return fmt.Errorf("season validation failed: %v", err)
	}
	if err := utils.ValidateConservation(species); err != nil {
		return fmt.Errorf("conservation validation failed: %v", err)
	}

	key := "CollectionEvent:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("collection event %s already exists", id)
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

	if err := utils.AddToBatchIndex(ctx, id, key); err != nil {
		return err
	}

	if err := utils.EmitEvent(ctx, "CollectionEventCreated", bz); err != nil {
		return nil // ignore event failure
	}

	return nil
}
