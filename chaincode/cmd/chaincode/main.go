package main

import (
	"fmt"

	"supplychain/contracts/supchain" // ✅ folder name is supchain

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc := new(supchain.SupplyChainContract) // ✅ match package name inside contract.go
	chaincode, err := contractapi.NewChaincode(cc)
	if err != nil {
		fmt.Printf("Error creating chaincode: %v", err)
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %v", err)
	}
}
