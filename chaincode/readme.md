# Traceher Chaincode (Hyperledger Fabric) - Product-grade implementation

## Overview
This chaincode implements a permissioned, role-based traceability system for Ayurvedic herbs:
- Roles: Farmers (coops), Wild Collectors, Labs, Processors, Manufacturers.
- Events: CollectionEvent, QualityTestEvent, ProcessingStep, FinalBatch (with QR payload).
- Provenance queries: FHIR-style provenance bundle for consumer/portal.
- Validations: geo-fencing, seasonal, conservation, quality thresholds (stubs provided).
- Events: Fabric events emitted for integration services to generate QR images and ERP sync.

## Deploy
- Ensure Fabric vX and contract-api-go version compatibility.
- Build and package the chaincode, then install/approve/commit as usual.

## Contracts and API (function signatures)
- FarmerContract.CreateCollectionEvent(ctx, id, species, location, timestamp, quality)
- FarmerContract.ReadCollectionEvent(ctx, id)
- CollectorContract.CreateWildCollectionEvent(ctx, id, species, location, timestamp, quality)
- LabContract.AddQualityTest(ctx, id, batchID, results, timestamp)
- LabContract.ReadQualityTest(ctx, id)
- ProcessorContract.AddProcessingStep(ctx, id, batchID, action, notes, timestamp)
- ManufacturerContract.FinalizeBatch(ctx, id, batchID, timestamp)
- ManufacturerContract.ReadFinalBatch(ctx, id)
- ProvenanceContract.GetProvenanceBundle(ctx, batchID)
- ProvenanceContract.GetHistoryForKey(ctx, key)

## Notes for integration engineers
- Listen for Fabric events:
  - CollectionEventCreated
  - QualityTestAdded
  - ProcessingStepAdded
  - FinalBatchCreated
- When FinalBatchCreated received, backend should:
  1. Read event QR payload
  2. Generate QR image (lib: qrcode for node/python/go)
  3. Send QR image/label to printing line or packaging system.
  4. Expose `GET /api/provenance/{batchID}` which calls chaincode GetProvenanceBundle.

## Extensibility
- Validation rules currently inline stubs; migrate to an on-chain registry or off-chain trusted service as needed.
- Add Retailer and Regulator contracts similarly.
