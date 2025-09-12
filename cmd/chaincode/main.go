package main

import (
	"fmt"
	"permissionedchain/contracts/supplychain"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc := new(supplychain.SupplyChainContract)
	chaincode, err := contractapi.NewChaincode(cc)
	if err != nil {
		fmt.Printf("Error creating chaincode: %v", err)
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %v", err)
	}
}
