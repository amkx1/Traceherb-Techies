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

// SupplyChainContract implements chaincode
type SupplyChainContract struct {
	contractapi.Contract
}

// RegisterCollector registers a collector (farmer/wild)
func (c *SupplyChainContract) RegisterCollector(ctx contractapi.TransactionContextInterface, collector models.Collector) error {
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

	ctx.GetStub().SetEvent(events.EventName("CollectorRegistered"), events.Payload(map[string]string{"collectorId": collector.ID}))

	return nil
}

// RecordCollectionEvent logs a geo-tagged harvest event
func (c *SupplyChainContract) RecordCollectionEvent(ctx contractapi.TransactionContextInterface, ev models.CollectionEvent) error {
	collKey := utils.KeyFor("COLLECTOR", ev.CollectorID)
	cb, err := ctx.GetStub().GetState(collKey)
	if err != nil || cb == nil {
		return fmt.Errorf("collector not registered: %s", ev.CollectorID)
	}

	if allowed := geo.IsPointAllowed(ev.Latitude, ev.Longitude, ev.Species); !allowed {
		return fmt.Errorf("geo-fence violation: location not permitted for species %s", ev.Species)
	}

	if !utils.IsHarvestAllowedForSpecies(ev.Species, ev.Timestamp) {
		return fmt.Errorf("harvest not allowed for species %s at %s", ev.Species, ev.Timestamp)
	}

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

	// Composite key to link batch with collections (assuming batchId in ev.Quantity or extended)
	// For demo, using CollectorID - extend as per batch management
	ck, _ := ctx.GetStub().CreateCompositeKey("CollectionByCollector", []string{ev.CollectorID, ev.EventID})
	ctx.GetStub().PutState(ck, []byte{0x00})

	ctx.GetStub().SetEvent(events.EventName("CollectionRecorded"), events.Payload(map[string]string{"eventId": ev.EventID, "collectorId": ev.CollectorID}))

	return nil
}

// RecordQualityTest logs lab test results
func (c *SupplyChainContract) RecordQualityTest(ctx contractapi.TransactionContextInterface, qt models.QualityTest) error {
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

	ctx.GetStub().SetEvent(events.EventName("QualityTestRecorded"), events.Payload(map[string]string{"testId": qt.TestID, "batchId": qt.BatchID}))
	return nil
}

// RecordProcessingStep logs processing steps (drying, grinding, storage)
func (c *SupplyChainContract) RecordProcessingStep(ctx contractapi.TransactionContextInterface, ps models.ProcessingStep) error {
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

	ctx.GetStub().SetEvent(events.EventName("ProcessingStepRecorded"), events.Payload(map[string]string{"stepId": ps.StepID, "batchId": ps.BatchID}))
	return nil
}

// GenerateProductQR returns a QR token mapped to batchId
func (c *SupplyChainContract) GenerateProductQR(ctx contractapi.TransactionContextInterface, batchId string) (string, error) {
	token := utils.UUID("QR")
	key := utils.KeyFor("QRMAP", token)
	if err := ctx.GetStub().PutState(key, []byte(batchId)); err != nil {
		return "", err
	}
	return token, nil
}

// QueryProvenance returns a full provenance bundle for batchId (complex aggregation)
func (c *SupplyChainContract) QueryProvenance(ctx contractapi.TransactionContextInterface, batchId string) (string, error) {
	// Aggregation implementation to query all related collection, quality & processing events

	// NOTE: Replace composite key queries below with your indexing keys as needed!
	collections := []models.CollectionEvent{}
	qualTests := []models.QualityTest{}
	procSteps := []models.ProcessingStep{}

	// Query collections related to batchId (simplified example)
	collResults, err := ctx.GetStub().GetStateByPartialCompositeKey("CollectionByBatch", []string{batchId})
	if err != nil {
		return "", err
	}
	defer collResults.Close()
	for collResults.HasNext() {
		kv, err := collResults.Next()
		if err != nil {
			return "", err
		}
		var ce models.CollectionEvent
		json.Unmarshal(kv.Value, &ce)
		collections = append(collections, ce)
	}

	// Query quality tests for batchId
	qualResults, err := ctx.GetStub().GetStateByPartialCompositeKey("QualityByBatch", []string{batchId})
	if err != nil {
		return "", err
	}
	defer qualResults.Close()
	for qualResults.HasNext() {
		kv, err := qualResults.Next()
		if err != nil {
			return "", err
		}
		var qt models.QualityTest
		json.Unmarshal(kv.Value, &qt)
		qualTests = append(qualTests, qt)
	}

	// Query processing steps for batchId
	procResults, err := ctx.GetStub().GetStateByPartialCompositeKey("ProcessByBatch", []string{batchId})
	if err != nil {
		return "", err
	}
	defer procResults.Close()
	for procResults.HasNext() {
		kv, err := procResults.Next()
		if err != nil {
			return "", err
		}
		var ps models.ProcessingStep
		json.Unmarshal(kv.Value, &ps)
		procSteps = append(procSteps, ps)
	}

	bundle := map[string]interface{}{
		"resourceType":     "Bundle",
		"type":             "collection",
		"batchId":          batchId,
		"collectionEvents": collections,
		"qualityTests":     qualTests,
		"processingSteps":  procSteps,
	}
	jb, _ := json.Marshal(bundle)
	return string(jb), nil
}

// RecallBatch marks a batch as recalled for notification
func (c *SupplyChainContract) RecallBatch(ctx contractapi.TransactionContextInterface, batchId string) error {
	if ok, _ := acl.HasRole(ctx, "admin"); !ok {
		return fmt.Errorf("admin role required for recall")
	}
	key := utils.KeyFor("RECALL", batchId)
	if err := ctx.GetStub().PutState(key, []byte("recalled")); err != nil {
		return err
	}
	ctx.GetStub().SetEvent(events.EventName("BatchRecalled"), events.Payload(map[string]string{"batchId": batchId}))
	return nil
}
