package contracts

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"traceherb/chaincode/models"
	"traceherb/chaincode/utils"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// FarmerContract handles farmer/cooperative actions
type FarmerContract struct {
	contractapi.Contract
}

// CreateCollectionEvent - farmer creates a collection event; id acts as batch id downstream
func (fc *FarmerContract) CreateCollectionEvent(ctx contractapi.TransactionContextInterface,
	id, species, location, timestamp, quality, quantityKg, notes string) error {

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

	// Parse location: expected format "lat,lon"
	locMap := make(map[string]float64)
	parts := strings.Split(location, ",")
	if len(parts) == 2 {
		lat, _ := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
		lon, _ := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
		locMap["lat"] = lat
		locMap["lon"] = lon
	}

	// Parse quantity
	qty, _ := strconv.ParseFloat(quantityKg, 64)

	// Build event aligned to model
	event := models.CollectionEvent{
		ResourceType: "CollectionEvent",
		ID:           id,
		CollectorID:  clientID,
		ActorType:    "farmer",
		Species:      species,
		QuantityKg:   qty,
		Location:     locMap,
		Timestamp:    timestamp,
		InitialQual:  map[string]interface{}{"grade": quality},
		Notes:        notes,
		BatchID:      "", // linked later
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

	// emit event (non-fatal)
	if err := utils.EmitEvent(ctx, "CollectionEventCreated", bz); err != nil {
		fmt.Println("warning: event emit failed:", err)
	}

	return nil
}

// ReadCollectionEvent retrieves a farmer collection event
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
