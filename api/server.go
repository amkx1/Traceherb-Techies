package api

import (
	"encoding/json"
	"log"
	"net/http"
)

// Lightweight REST adapter that calls chaincode via Fabric SDK (pseudo-code)

func Start(port string) {
	http.HandleFunc("/provenance/", provenanceHandler)
	log.Printf("API server listening on %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func provenanceHandler(w http.ResponseWriter, r *http.Request) {
	// parse batch id
	batch := r.URL.Query().Get("batchId")
	if batch == "" {
		http.Error(w, "missing batchId", http.StatusBadRequest)
		return
	}
	// TODO: call Fabric SDK to invoke QueryProvenance
	resp := map[string]string{"batchId": batch, "message": "SDK call not implemented in this skeleton"}
	json.NewEncoder(w).Encode(resp)
}
