package contracts

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/amkx1/Traceherb-Techies/chaincode/models"
	"github.com/amkx1/Traceherb-Techies/chaincode/utils"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// CollectorContract for wild-collector groups
type CollectorContract struct {
	contractapi.Contract
}

// CreateWildCollectionEvent creates a new collection event for wild collectors
func (cc *CollectorContract) CreateWildCollectionEvent(ctx contractapi.TransactionContextInterface,
	id, species, location, timestamp, quality, quantityKg, notes string) error {

	// Get client identity
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

	// --------- Validations ----------
	if err := utils.ValidateGeoFence(location); err != nil {
		return fmt.Errorf("geo-fence validation failed: %v", err)
	}
	if err := utils.ValidateSeason(species, timestamp); err != nil {
		return fmt.Errorf("season validation failed: %v", err)
	}
	if err := utils.ValidateConservation(species); err != nil {
		return fmt.Errorf("conservation validation failed: %v", err)
	}

	// Check for duplicate
	key := "CollectionEvent:" + id
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("collection event %s already exists", id)
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

	// Build the event
	event := models.CollectionEvent{
		ResourceType: "CollectionEvent",
		ID:           id,
		CollectorID:  clientID,
		ActorType:    "wild_collector",
		Species:      species,
		QuantityKg:   qty,
		Location:     locMap,
		Timestamp:    timestamp,
		InitialQual:  map[string]interface{}{"grade": quality},
		Notes:        notes,
		BatchID:      "", // linked later
	}

	// Marshal to JSON
	bz, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// Save to ledger
	if err := ctx.GetStub().PutState(key, bz); err != nil {
		return err
	}

	// Add to batch index
	if err := utils.AddToBatchIndex(ctx, id, key); err != nil {
		return err
	}

	// Emit event
	if err := utils.EmitEvent(ctx, "CollectionEventCreated", bz); err != nil {
		// not fatal
		fmt.Println("warning: failed to emit event:", err)
	}

	return nil
}
