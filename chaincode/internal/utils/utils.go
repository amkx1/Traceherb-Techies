package utils

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func KeyFor(prefix, id string) string {
	return fmt.Sprintf("%s~%s", prefix, id)
}

func UUID(prefix string) string {
	return fmt.Sprintf("%s-%s", prefix, uuid.New().String())
}

func NowISO(ctx contractapi.TransactionContextInterface) string {
	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return time.Now().UTC().Format(time.RFC3339)
	}
	return time.Unix(ts.Seconds, int64(ts.Nanos)).UTC().Format(time.RFC3339)
}

// Harvest window stub: allow for demo; replace with policy DB/service
func IsHarvestAllowedForSpecies(species string, timestamp string) bool {
	// Example: allow always for demo
	_ = species
	_ = timestamp
	return true
}
