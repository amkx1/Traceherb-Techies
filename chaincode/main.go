package main

import (
	"log"

	"traceherb/chaincode/contracts"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc, err := contractapi.NewChaincode(
		new(contracts.FarmerContract),
		new(contracts.CollectorContract),
		new(contracts.LabContract),
		new(contracts.ProcessorContract),
		new(contracts.ManufacturerContract),
		new(contracts.ProvenanceContract),
		new(contracts.RecallContract),
	)
	if err != nil {
		log.Panicf("Error creating Traceher chaincode: %v", err)
	}

	if err := cc.Start(); err != nil {
		log.Panicf("Error starting Traceher chaincode: %v", err)
	}
}
