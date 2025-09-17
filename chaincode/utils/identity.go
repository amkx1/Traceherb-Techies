package contracts

import (
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// GetClientID - full x509-style ID string
func GetClientID(ctx contractapi.TransactionContextInterface) (string, error) {
	id, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client id: %v", err)
	}
	return id, nil
}

// GetClientMSP - MSP ID of caller
func GetClientMSP(ctx contractapi.TransactionContextInterface) (string, error) {
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get client msp id: %v", err)
	}
	return msp, nil
}

// AssertOrg - helper to enforce expected MSP
func AssertOrg(ctx contractapi.TransactionContextInterface, expectedMSP string) error {
	msp, err := GetClientMSP(ctx)
	if err != nil {
		return err
	}
	if msp != expectedMSP {
		return fmt.Errorf("access denied: required msp %s, caller msp %s", expectedMSP, msp)
	}
	return nil
}
