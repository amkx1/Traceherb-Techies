package models

// CollectionEvent - created by Farmer or Wild Collector
type CollectionEvent struct {
	ID        string `json:"id"` // unique event id (used as batch id for downstream)
	Species   string `json:"species"`
	Location  string `json:"location"`  // "lat,lon"
	Collector string `json:"collector"` // clientID (x509 style)
	Org       string `json:"org"`       // MSP id
	Timestamp string `json:"timestamp"` // ISO8601
	Quality   string `json:"quality"`   // small JSON or CSV: e.g., "moisture:10"
}
