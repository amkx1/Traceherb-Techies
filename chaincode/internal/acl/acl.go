package acl

import (
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// IsAllowed checks a simple permission string against invoker MSP and attributes
func IsAllowed(ctx contractapi.TransactionContextInterface, permission string) (bool, error) {
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return false, err
	}
	// quick allow for known MSPs (example); replace with real consortium policy
	if msp == "Org1MSP" || msp == "Org2MSP" {
		return true, nil
	}
	// fallback to attribute-based check
	has, err := HasAttribute(ctx, "role")
	if err != nil {
		return false, err
	}
	if has {
		ok, _ := HasRole(ctx, "admin")
		return ok, nil
	}
	return false, fmt.Errorf("permission denied for permission=%s msp=%s", permission, msp)
}

func HasAttribute(ctx contractapi.TransactionContextInterface, attr string) (bool, error) {
	cidObj, err := cid.New(ctx.GetStub())
	if err != nil {
		return false, err
	}
	_, found, err := cidObj.GetAttributeValue(attr)
	if err != nil {
		return false, err
	}
	return found, nil
}

func HasRole(ctx contractapi.TransactionContextInterface, role string) (bool, error) {
	cidObj, err := cid.New(ctx.GetStub())
	if err != nil {
		return false, err
	}
	val, found, err := cidObj.GetAttributeValue("role")
	if err != nil {
		return false, err
	}
	if !found {
		return false, nil
	}
	return val == role, nil
}
