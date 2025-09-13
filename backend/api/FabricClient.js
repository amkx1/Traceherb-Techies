'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const ccpPath = path.resolve(__dirname, './config/connection.json');
const walletPath = path.resolve(__dirname, './config/wallet');

let gateway;
let contract;

async function initFabric() {
  const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
  const ccp = JSON.parse(ccpJSON);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'appUser',
    discovery: { enabled: true, asLocalhost: false }
  });

  const network = await gateway.getNetwork('mychannel');
  contract = network.getContract('supplychain');
}

function getContract() {
  if (!contract) throw new Error('Fabric not initialized yet');
  return contract;
}

async function submitTransaction(functionName, ...args) {
  const result = await contract.submitTransaction(functionName, ...args);
  return result.toString();
}

async function evaluateTransaction(functionName, ...args) {
  const result = await contract.evaluateTransaction(functionName, ...args);
  return result.toString();
}

async function disconnect() {
  if (gateway) await gateway.disconnect();
}

module.exports = {
  initFabric,
  getContract,
  submitTransaction,
  evaluateTransaction,
  disconnect
};
