#!/bin/bash

# Stop on first error
set -e

# Go to project root
cd "$(dirname "$0")"

# Set Fabric binaries path
export PATH=$PWD/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=$PWD/fabric-samples/test-network

# Network variables
CHANNEL_NAME="mychannel"
CHAINCODE_NAME="traceherb"
CHAINCODE_VERSION="1.0"
CHAINCODE_LANG="golang"
CHAINCODE_PATH="./chaincode"

# Peers and Orgs
PEERS=("peer0.farmer.example.com" "peer0.collector.example.com" "peer0.lab.example.com" "peer0.manufacturer.example.com" "peer0.processor.example.com")
PEER_PORTS=(7051 8051 9051 10051 11051)
ORDERER="orderer.example.com:7050"
TLS_ROOT_CERT="$FABRIC_CFG_PATH/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

echo "Stopping any running network..."
./fabric-samples/test-network/network.sh down

echo "Starting network..."
./fabric-samples/test-network/network.sh up createChannel -c $CHANNEL_NAME -s couchdb

echo "Deploying chaincode..."
# Package chaincode
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path $CHAINCODE_PATH --lang $CHAINCODE_LANG --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

# Install chaincode on all peers
for i in ${!PEERS[@]}; do
  export CORE_PEER_LOCALMSPID="${PEERS[$i]%.*}MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE="$FABRIC_CFG_PATH/organizations/peerOrganizations/${PEERS[$i]#peer0.}/msp/tlscacerts/tlsca.${PEERS[$i]#peer0.}-cert.pem"
  export CORE_PEER_MSPCONFIGPATH="$FABRIC_CFG_PATH/organizations/peerOrganizations/${PEERS[$i]#peer0.}/users/Admin@${PEERS[$i]#peer0.}/msp"
  export CORE_PEER_ADDRESS="localhost:${PEER_PORTS[$i]}"
  
  echo "Installing chaincode on ${PEERS[$i]}..."
  peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
done

# Approve chaincode for all orgs
for i in ${!PEERS[@]}; do
  export CORE_PEER_LOCALMSPID="${PEERS[$i]%.*}MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE="$FABRIC_CFG_PATH/organizations/peerOrganizations/${PEERS[$i]#peer0.}/msp/tlscacerts/tlsca.${PEERS[$i]#peer0.}-cert.pem"
  export CORE_PEER_MSPCONFIGPATH="$FABRIC_CFG_PATH/organizations/peerOrganizations/${PEERS[$i]#peer0.}/users/Admin@${PEERS[$i]#peer0.}/msp"
  export CORE_PEER_ADDRESS="localhost:${PEER_PORTS[$i]}"
  
  echo "Approving chaincode for ${PEERS[$i]}..."
  peer lifecycle chaincode approveformyorg \
    --orderer $ORDERER \
    --tls --cafile $TLS_ROOT_CERT \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --package-id $(peer lifecycle chaincode queryinstalled | awk '/${CHAINCODE_NAME}_${CHAINCODE_VERSION}/ {print $3}' | tr -d ',') \
    --sequence 1
done

# Commit chaincode
peer lifecycle chaincode commit -o $ORDERER --tls --cafile $TLS_ROOT_CERT \
  -C $CHANNEL_NAME \
  --name $CHAINCODE_NAME \
  --version $CHAINCODE_VERSION \
  --sequence 1 \
  --peerAddresses ${PEERS[@]/#/localhost:} \
  --tlsRootCertFiles ${PEERS[@]/#/$FABRIC_CFG_PATH/organizations/peerOrganizations/} 

echo "✅ Traceher chaincode deployed successfully!"
