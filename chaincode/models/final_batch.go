package main

// FinalBatch - created by Manufacturer, contains QR payload stored on-chain
type FinalBatch struct {
	ID           string `json:"id"`           // unique final batch id
	BatchID      string `json:"batch_id"`     // original collection/batch id
	Manufacturer string `json:"manufacturer"` // clientID
	Org          string `json:"org"`          // MSP id
	QRPayload    string `json:"qr_payload"`   // e.g., traceher://batch/<hash>
	Timestamp    string `json:"timestamp"`
	// You may extend with formulation parameters, packaging, expiry date etc.
}
