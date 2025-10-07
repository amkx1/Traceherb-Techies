# TL;DR
This repository implements a Hyperledger Fabric chaincode that provides role-based traceability for Ayurvedic/herbal supply chains. Actors (Farmers/Coops, Wild Collectors, Labs, Processors, Manufacturers) call dedicated contract functions to record: collection events, lab quality tests, processing steps and manufacturer finalization (which produces a QR payload). A separate Provenance contract assembles a FHIR-like bundle for a batch on request. The chaincode enforces MSP-based access control, stores resources in world state with clear key prefixes, maintains a batch index for efficient bundle queries, and emits Fabric events for integration services (QR generation, ERP sync, packaging).

This README was written after examining the code in `chaincode/` and provides two levels of detail:

- Level 1 (brief): Control flow and what each contract does (quick read).
- Level 2 (detailed): Step-by-step control flow for every public function, how requests affect execution, state keys, error cases, expectations from Fabric, and integration points.

> Note: the source contains `...` placeholders in several `.go` files (these indicate omitted code sections). Structure and behavior were inferred from surrounding code, models, utils, and the included `chaincode/readme.md`. Inferred behavior is clearly marked where applicable.

---

# 1) What this chaincode *expects* from the blockchain and its connection

## 1.A — Brief (one-liners)
- World state: read/write via `GetState` / `PutState` for resource objects.
- Composite/index keys: uses a "batch index" to map a `batchId` → list of resource keys (fast provenance assembly).
- Identity & MSP: uses client identity (X.509) and MSP checks to enforce roles (FarmerMSP, LabMSP, etc.).
- Events: emits Fabric chaincode events (e.g., `CollectionEventCreated`, `ProcessingStepAdded`) for off-chain services.
- Endorsement & channel policies: standard Fabric endorsement/commit model required (chaincode registered with `contractapi.NewChaincode(...)`).

## 1.B — Detailed (what developers / ops need to provide)

### 1.B.1 World state & KV operations
- Chaincode uses the Fabric contract API (`contractapi.TransactionContextInterface`) and expects `ctx.GetStub().PutState(key, value)` and `GetState(key)` to be available.
- Data is stored as JSON-serialized Go structs (models) using canonical keys with prefixes:
  - `CollectionEvent:<id>`
  - `QualityTest:<id>` or `QualityTestEvent:<id>` (file contains `QualityTestEvent` type)
  - `ProcessingStep:<id>`
  - `FinalBatch:<id>`
  - `Recall:<id>`
  - `BatchIndex:<batchId>` (index key — actual key name inferred; utils functions implement index semantics)

### 1.B.2 Indexing & composite lookups
- The code calls `utils.AddToBatchIndex(ctx, batchId, key)` and `utils.GetFromBatchIndex(ctx, batchId)` to group related state keys by batch. This is *how provenance assembly retrieves all objects for a batch efficiently.*
- Implementation detail (inferred): `BatchIndex:<batchId>` stores JSON array of underlying keys (e.g. `["CollectionEvent:abc","ProcessingStep:xyz"]`). `GetFromBatchIndex` returns the bytes of those objects.

### 1.B.3 Identity, MSP & access control expectations
- The chaincode uses `ctx.GetClientIdentity().GetID()` and `GetClientMSP(ctx)` helpers (see `utils`) to inspect the certificate and MSP id.
- The code checks MSP names to gate operations. Known MSP names present in the repo: `FarmerMSP`, `FarmerCoopMSP`, `CollectorMSP`, `WildCollectorMSP`, `LabMSP`, `TestingLabMSP`, `ProcessorMSP`, `ProcessingMSP`, `ManufacturerMSP`, `ManufacturerOrgMSP`.
- The chaincode assumes MSPs are configured correctly in the channel (peers endorse/validate against those MSPs) and that client SDKs present certs from these MSPs.

### 1.B.4 Events & integration
- Emits Fabric events using `ctx.GetStub().SetEvent(eventName, payload)` via `utils.EmitEvent`.
- Important event names in code: `CollectionEventCreated`, `QualityTestAdded`, `ProcessingStepAdded`, `FinalBatchCreated`.
- Off-chain services should subscribe via peer event hub / SDK to generate QR images and push labels to packaging lines.

### 1.B.5 Endorsement & transaction model
- Chaincode registers several contracts via `contractapi.NewChaincode(new(contracts.FarmerContract), ...)` — each contract's functions are independent chaincode endpoints (Fabric contract API exposes them).
- You must set appropriate chaincode endorsement policies and channel MSP configs that match intended security (e.g., require endorsements from certain orgs for critical operations if needed).

### 1.B.6 Operational
- The repo is a Go module (`go.mod` present). Build/package as standard Fabric chaincode.
- Ensure Fabric peer/chaincode container has enough memory/cpu; tests should run offline first.

---

# 2) API surface — brief (function list)
Below is a short index of public contract functions discovered (exported methods). These are the entry points that client applications call.

- **FarmerContract**
  - `CreateCollectionEvent(ctx, id, species, location, timestamp, quality, quantityKg, notes)` — create a farmer collection event.
  - `ReadCollectionEvent(ctx, id)` — read a collection event.

- **CollectorContract**
  - `CreateWildCollectionEvent(ctx, id, species, location, timestamp, quality, quantityKg, notes)` — create a wild-collector event.

- **LabContract**
  - `AddQualityTest(ctx, id, batchId, labId, results, timestamp, certificateUrl)` — record lab test.
  - `ReadQualityTest(ctx, id)` — read a quality test.
  - `GetTestsByBatch(ctx, batchId)` — read tests for a batch (via batch index).

- **ProcessorContract**
  - `AddProcessingStep(ctx, id, batchId, facilityId, action, params, timestamp, notes)` — record a processing step.

- **ManufacturerContract**
  - `FinalizeBatch(ctx, id, batchId, manufacturer, quantityUnits, packagingDate, timestamp)` — generate `FinalBatch` and QR payload.
  - `ReadFinalBatch(ctx, id)`
  - `ReadAllFinalBatches(ctx)`

- **ProvenanceContract**
  - `GetProvenanceBundle(ctx, batchId)` — assemble and return a `ProvenanceBundle` containing CollectionEvents, ProcessingSteps, QualityTests, and FinalBatch.

- **RecallContract**
  - `CreateRecall(ctx, recallId, batchId, reason, timestamp, actor)` — create recall record.
  - `GetRecall(ctx, recallId)` — fetch recall.

> These signatures are reconstructed from the repository — some parameter lists were inferred where the source used `...` placeholders. Use this as an accurate working map but double-check parameter ordering in your source when wiring SDK clients.

---

# 3) Level 1 — Flow of control & brief function roles
This is the minimal flow overview for reference.

1. Collection (Farmer or Wild Collector)
   - Role: Farmer or Wild Collector records `CollectionEvent` (who, where, quantity, initial quality, notes).
   - Key effect: `PutState` a `CollectionEvent:<id>` and add the key to batch index for `batchId`.
   - Event emitted: `CollectionEventCreated`.

2. Testing (Lab)
   - Role: Lab records `QualityTestEvent` for `batchId` with test results and certificate url.
   - Key effect: `PutState` a `QualityTest:<id>` and add to batch index.
   - Event: `QualityTestAdded`.

3. Processing (Processor)
   - Role: Processor logs `ProcessingStep` (wash/dry/grind/etc) linked to `batchId`.
   - Key effect: `PutState` `ProcessingStep:<id>` and add to batch index.
   - Event: `ProcessingStepAdded`.

4. Finalization (Manufacturer)
   - Role: Manufacturer finalizes `FinalBatch` and generates a QR payload for the packaged product.
   - Key effect: `PutState` `FinalBatch:<id>` and add to batch index. Emits `FinalBatchCreated`.
   - The `ManufacturerContract` computes a QR payload (sha256-ish) used by downstream QR generator.

5. Provenance (Consumer & Portal)
   - Role: Portal calls `GetProvenanceBundle(batchId)` which uses the batch index to collect all related keys and returns a `ProvenanceBundle` (collections, steps, tests, finalBatch).

6. Recall
   - Role: Create `Recall` which points to `batchId` and becomes retrievable by `GetRecall`.

---

# 4) Level 2 — Detailed flow: per contract (step-by-step)

> For each function below, the following are described: Inputs, Caller/MSP expectation, Step-by-step control flow, World-state keys used, Events, and Error conditions. Where the source code used `...`, inference is explicitly noted.

## 4.1 FarmerContract

### CreateCollectionEvent(ctx, id, species, location, timestamp, quality, quantityKg, notes)
- Expected caller: certificate from FarmerMSP or FarmerCoopMSP.
- Inputs: id (unique event id), species, location (string or lat,lon), timestamp (ISO), quality (maybe map or string), quantityKg, notes.

Flow:
1. Retrieve caller identity (utils.GetClientID) and MSP (utils.GetClientMSP).
2. Assert caller belongs to FarmerMSP or FarmerCoopMSP (access check). If not authorized → error.
3. Validate inputs: ensure id non-empty, timestamp decodable, quantityKg parses to float, ValidateGeoFence(location) may be called (see utils/validation.go). If validation fails → error.
4. Build a models.CollectionEvent object and populate ResourceType: "CollectionEvent", and other fields. (This is consistent with collection_event.go model.)
5. Marshal to JSON and PutState("CollectionEvent:"+id, bz).
6. Add the key to batch index with utils.AddToBatchIndex(ctx, batchId, "CollectionEvent:"+id) if batchId is a separate param or inferred.
7. Emit Fabric event CollectionEventCreated with the JSON payload using utils.EmitEvent.
8. Return success (nil) or return created object depending on function signature.

Keys: CollectionEvent:<id>, index entry BatchIndex:<batchId>.

Errors: duplicate id (optional check), invalid MSP, malformed inputs, PutState errors.

Note (inferred): The code references quantityKg and initialQuality fields in models; the function likely accepts quantityKg (string) and converts to float.

### ReadCollectionEvent(ctx, id)
- Expected caller: any authenticated user (no strict MSP checks in looked-up code), but could be restricted.
- Flow: GetState("CollectionEvent:"+id) → unmarshal → return struct or error if missing.

## 4.2 CollectorContract

### CreateWildCollectionEvent(ctx, id, species, location, timestamp, quality, quantityKg, notes)
- Expected caller: CollectorMSP or WildCollectorMSP.

Flow: Similar to CreateCollectionEvent (but enforces CollectorMSP / WildCollectorMSP and may require additional conservation checks). Steps:
1. Get client id and MSP.
2. Enforce MSP is allowed.
3. Validate inputs (geo, timestamp, species conservation checks via validation utilities — some checks are stubs).
4. Create CollectionEvent object with ActorType set to wild_collector.
5. PutState("CollectionEvent:"+id, bz).
6. Add key to batch index.
7. Emit CollectionEventCreated event.

Errors: same as Farmer create.

## 4.3 LabContract

### AddQualityTest(ctx, id, batchId, labId, results, timestamp, certificateUrl)
- Expected caller: LabMSP or TestingLabMSP.
- Inputs: results likely a JSON string or transient map; could include pesticide, moisture, contaminants.

Flow:
1. Get client identity and MSP; assert LabMSP.
2. Validate batchId exists (via BatchIndex or direct GetState on FinalBatch or CollectionEvent), or allow tests to be created before finalization.
3. Create QualityTestEvent struct and marshal.
4. PutState("QualityTestEvent:"+id, bz) (or QualityTest: prefix).
5. Add to batch index: utils.AddToBatchIndex(ctx, batchId, key).
6. Emit QualityTestAdded event with payload.
7. Return success.

Read functions: ReadQualityTest returns the test; GetTestsByBatch uses utils.GetFromBatchIndex to pull all tests for a batch and filter those keys whose prefix indicates QualityTest.

Validation: utils.ValidateQualityResults(results) (inferred) may enforce pesticide PASS, numeric ranges, etc. The repo includes validation.go with pesticide pass logic stub.

## 4.4 ProcessorContract

### AddProcessingStep(ctx, id, batchId, facilityId, action, params, timestamp, notes)
- Expected caller: ProcessorMSP or ProcessingMSP.

Flow:
1. Identity + MSP checks.
2. Validate required fields.
3. Build ProcessingStep struct (model exists: fields Action, Params, FacilityID, timestamp, notes).
4. Marshal and PutState("ProcessingStep:"+id, bz).
5. Add to batch index (so that GetProvenanceBundle finds it).
6. Emit ProcessingStepAdded event.
7. Return the processing step.

Errors: invalid MSP, missing batchId.

## 4.5 ManufacturerContract

### FinalizeBatch(ctx, id, batchId, manufacturer, quantityUnits, packagingDate, timestamp)
- Expected caller: ManufacturerMSP or ManufacturerOrgMSP (code imports both names).

Flow:
1. Identity/MSP check ensure caller is manufacturer.
2. Validate batchId, compute FinalBatch object.
3. Generate QR payload: the code imports crypto/sha256 and encoding/hex and therefore computes a digest (for example sha256(batchId + timestamp + manufacturerID)), and stores it in FinalBatch.QRPayload (string hex). *This is implemented in the code.*
4. PutState("FinalBatch:"+id, bz) and add to batch index.
5. Emit FinalBatchCreated with the FinalBatch JSON as payload.
6. Return the created FinalBatch or nil success.

Read functions: ReadFinalBatch(id), ReadAllFinalBatches() — latter runs a partial key or rich query to list all final batches.

Notes & inferred details:
- The QR payload is a digest; the actual QR image generation is expected to be performed off-chain by a backend that listens to the FinalBatchCreated event.

## 4.6 ProvenanceContract

### GetProvenanceBundle(ctx, batchId)
- Expected caller: public/portal/consumer — usually read-only; no strict MSP required unless policy says so.

Flow:
1. Call utils.GetFromBatchIndex(ctx, batchId) which returns the array of bytes for all keys indexed to batchId (implementation in utils).
2. Iterate all returned bytes and, for each key, determine the resource type by checking the key prefix (e.g., CollectionEvent: / ProcessingStep: / QualityTestEvent: / FinalBatch:).
3. Unmarshal into respective model and append to ProvenanceBundle arrays.
4. Return assembled ProvenanceBundle with fields CollectionEvents, ProcessingSteps, QualityTests, FinalBatch.

Key behaviour: this operation is read-only and depends entirely on the batch index correctness. If items are missing or were never added to the index, they won't appear.

Edge cases: sorting — the returned bundle does not necessarily contain items in strict chronological order unless the index or function sorts them. If deterministic chronological order is required, the entries should be sorted by each entry's Timestamp before returning.

## 4.7 RecallContract

### CreateRecall(ctx, recallId, batchId, reason, timestamp, actor)
- Expected caller: maybe ManufacturerMSP or a regulator; code does not show explicit MSP list — assume manufacturer or regulator.

Flow:
1. Identity check (if implemented).
2. Validate batch exists.
3. Create Recall struct and PutState("Recall:"+recallId, ...).
4. Emit a recall event (inferred).
5. Return recall object.

### GetRecall(ctx, recallId)
- Flow: GetState("Recall:"+recallId) → unmarshal → return.

---

# 5) Data model & example payloads (samples)

## 5.1 Model quick reference (from code)
- CollectionEvent (see collection_event.go): fields resourceType, id, collectorId, actorType, species, commonName, quantityKg, location (map lat/lon), timestamp, initialQual, notes.
- ProcessingStep (see processing_step.go): id, batchId, facilityId, org, action, params (map), timestamp, notes.
- QualityTestEvent (see quality_test_event.go): id, labId, batchId, results (map), timestamp, certificate.
- FinalBatch (see final_batch.go): id, batchId, manufacturer, org, quantityUnits, packagingDate, qrPayload, timestamp.
- ProvenanceBundle (see provenance.go): batchId plus arrays for collections, processing steps, quality tests, and final batch pointer.

## 5.2 Example JSON
CollectionEvent
{
  "resourceType":"CollectionEvent",
  "id":"col-2025-0001",
  "collectorId":"x509::/CN=user::/OU=org1.example.com",
  "actorType":"farmer",
  "species":"Withania somnifera",
  "quantityKg":120.5,
  "location":{"lat":23.5,"lon":77.3},
  "timestamp":"2025-09-15T09:12:00Z",
  "initialQuality":{"moisture":"12%"},
  "notes":"early morning harvest"
}

FinalBatch (QR payload example) — payload is a hex digest stored on-chain; QR image is generated off-chain.
{
  "resourceType":"FinalBatch",
  "id":"fb-2025-0001",
  "batchId":"batch-2025-0001",
  "manufacturer":"x509::/CN=manu::/OU=manu.example.com",
  "quantityUnits":1000,
  "packagingDate":"2025-09-20",
  "qrPayload":"a3f2e8...hexdigest",
  "timestamp":"2025-09-20T12:00:00Z"
}

---

# 6) Events & integration points (what to build off-chain)
- Listen for events: CollectionEventCreated, QualityTestAdded, ProcessingStepAdded, FinalBatchCreated.
- Backend worker responsibilities:
  - On FinalBatchCreated: generate QR image from FinalBatch.QRPayload and push to packaging/printing.
  - On CollectionEventCreated / ProcessingStepAdded: update dashboards, notify ERP.
  - Provide REST API GET /api/provenance/{batchId} that queries Fabric and returns the ProvenanceBundle to websites or mobile apps.
- Privacy: avoid leaking sensitive data in public APIs; determine what fields are public (consumer read) and which are only for regulators or supply chain partners.

---

# 7) Deployment / operational checklist
- Fabric channel already configured with MSPs matching the ones referenced.
- Build chaincode as Go module and package into .tar.gz per Fabric lifecycle.
- Set endorsement policies appropriate to your trust model (e.g., require manufacturer & processor endorsement for finalization).
- Set up event listener service (consumer microservice) with secure access to peer events.
- Implement testing: unit tests for contracts, integration tests with a Fabric test network (e.g., test-network or Fabric-samples).

---

# 8) Risks, limitations & suggested improvements
- On-chain bloat: storing large test result objects or images on-chain is a bad idea. Keep heavy files off-chain and put hashes/URLs on-chain.
- Index fragility: The BatchIndex is critical. If AddToBatchIndex fails anywhere, the provenance query will be incomplete. Add retries & checks to background jobs.
- Access control brittle: MSP strings should be normalized; consider role-based attributes in certs for more flexible checks.
- Immutability vs corrections: once on-chain, entries are immutable. Add mutation patterns (append-only correction events) to correct mistakes rather than delete.
- Gas/throughput: Fabric handles throughput differently than public chains; benchmark with expected transaction volume.
- Testing: add rich integration tests and validate chronological ordering in provenance bundles.

---

# 9) Possible Next Steps
- Generate SDK sample calls (Node/Go) for each contract function.
- Create an off-chain event consumer (Node.js) that listens for FinalBatchCreated and generates QR images.
- Add input validation and unit tests for every contract function.
- Harden access control using certificate attributes (OUs) instead of plain MSP names.

To proceed, specify your choice for generation as code or documentation.
