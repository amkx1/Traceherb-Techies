package supchain

import (
	"encoding/json"
	"fmt"

	"supplychain/internal/acl"
	"supplychain/internal/events"
	"supplychain/internal/geo"
	"supplychain/internal/utils"
	"supplychain/models"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SupplyChainContract implements chaincode methods for the supply chain
type SupplyChainContract struct {
	contractapi.Contract
}

// RegisterCollector registers a collector (farmer or wild-collector)
func (c *SupplyChainContract) RegisterCollector(ctx contractapi.TransactionContextInterface, collector models.Collector) error {
	// basic ACL: allow if invoker MSP is in consortium or role 'admin'
	ok, err := acl.IsAllowed(ctx, "register:collector")
	if err != nil || !ok {
		return fmt.Errorf("access denied: register collector")
	}

	key := utils.KeyFor("COLLECTOR", collector.ID)
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("collector exists: %s", collector.ID)
	}

	collector.CreatedAt = utils.NowISO(ctx)
	b, _ := json.Marshal(collector)
	if err := ctx.GetStub().PutState(key, b); err != nil {
		return err
	}

	ctx.GetStub().SetEvent(events.EventName("CollectorRegistered"), events.Payload(map[string]string{
		"collectorId": collector.ID,
	}))
	return nil
}

// RecordCollectionEvent logs a collection event (geo-tagging, harvest)
func (c *SupplyChainContract) RecordCollectionEvent(ctx contractapi.TransactionContextInterface, ev models.CollectionEvent) error {
	// ensure the caller is a registered collector (or gateway on behalf)
	collKey := utils.KeyFor("COLLECTOR", ev.CollectorID)
	cb, err := ctx.GetStub().GetState(collKey)
	if err != nil || cb == nil {
		return fmt.Errorf("collector not registered: %s", ev.CollectorID)
	}

	// Geo-fencing: verify lat/long within permitted zones for this species
	allowed := geo.IsPointAllowed(ev.Latitude, ev.Longitude, ev.Species)
	if !allowed {
		return fmt.Errorf("geo-fence violation: location not permitted for species %s", ev.Species)
	}

	// Seasonal & species conservation rules
	if !utils.IsHarvestAllowedForSpecies(ev.Species, ev.Timestamp) {
		return fmt.Errorf("harvest not allowed for species %s at %s", ev.Species, ev.Timestamp)
	}

	// Validate quality gate (basic thresholds)
	if !models.ValidateInitialQuality(ev) {
		return fmt.Errorf("initial quality metrics failed thresholds")
	}

	ev.EventID = utils.UUID("CE")
	ev.RecordedAt = utils.NowISO(ctx)
	key := utils.KeyFor("COLLECTION", ev.EventID)
	b, _ := json.Marshal(ev)
	if err := ctx.GetStub().PutState(key, b); err != nil {
		return err
	}

	// create composite key for lookup by batch/species/collector
	ck, _ := ctx.GetStub().CreateCompositeKey("CollectionByCollector", []string{ev.CollectorID, ev.EventID})
	ctx.GetStub().PutState(ck, []byte{0x00})

	ctx.GetStub().SetEvent(events.EventName("CollectionRecorded"), events.Payload(map[string]string{
		"eventId":     ev.EventID,
		"collectorId": ev.CollectorID,
	}))
	return nil
}

// RecordQualityTest logs lab test results
func (c *SupplyChainContract) RecordQualityTest(ctx contractapi.TransactionContextInterface, qt models.QualityTest) error {
	// only lab-role allowed
	if ok, _ := acl.HasRole(ctx, "lab"); !ok {
		return fmt.Errorf("access denied: lab role required")
	}
	qt.TestID = utils.UUID("QT")
	qt.Timestamp = utils.NowISO(ctx)
	key := utils.KeyFor("QUALITY", qt.TestID)
	b, _ := json.Marshal(qt)
	if err := ctx.GetStub().PutState(key, b); err != nil {
		return err
	}
	ctx.GetStub().SetEvent(events.EventName("QualityTestRecorded"), events.Payload(map[string]string{
		"testId":  qt.TestID,
		"batchId": qt.BatchID,
	}))
	return nil
}

// RecordProcessingStep logs processing steps (drying, grinding, storage)
func (c *SupplyChainContract) RecordProcessingStep(ctx contractapi.TransactionContextInterface, ps models.ProcessingStep) error {
	// processors only
	if ok, _ := acl.HasRole(ctx, "processor"); !ok {
		return fmt.Errorf("access denied: processor role required")
	}
	ps.StepID = utils.UUID("PS")
	ps.Timestamp = utils.NowISO(ctx)
	key := utils.KeyFor("PROCESS", ps.StepID)
	b, _ := json.Marshal(ps)
	if err := ctx.GetStub().PutState(key, b); err != nil {
		return err
	}
	ctx.GetStub().SetEvent(events.EventName("ProcessingStepRecorded"), events.Payload(map[string]string{
		"stepId":  ps.StepID,
		"batchId": ps.BatchID,
	}))
	return nil
}

// GenerateProductQR stores mapping of batch → QR token
func (c *SupplyChainContract) GenerateProductQR(ctx contractapi.TransactionContextInterface, batchId string) (string, error) {
	// This returns a QR token (not the image). Off-chain service uses this token to generate QR.
	token := utils.UUID("QR")
	// map token -> batchId on ledger
	key := utils.KeyFor("QRMAP", token)
	if err := ctx.GetStub().PutState(key, []byte(batchId)); err != nil {
		return "", err
	}
	return token, nil
}

// QueryProvenance bundles collection, quality and processing data for a batch
func (c *SupplyChainContract) QueryProvenance(ctx contractapi.TransactionContextInterface, batchId string) (string, error) {
	// Stub for now: in production, aggregate state queries
	bundle := map[string]string{
		"batchId": batchId,
		"status":  "bundle-generation-pending",
	}
	jb, _ := json.Marshal(bundle)
	return string(jb), nil
}
