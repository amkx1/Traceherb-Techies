// REMOVED: const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const config = require('../config/fabricConfig.json');

/**
 * Connect to Fabric and get a contract object
 * If contractName is provided, returns that specific contract (for multi-contract chaincode)
 */
async function getContract(contractName) {
  const ccpPath = path.resolve(__dirname, '..', config.connectionProfilePath);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  
  const walletPath = path.resolve(__dirname, '..', config.walletPath);
// REMOVED:   const wallet = await Wallets.newFileSystemWallet(walletPath);
  
// REMOVED:   const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: config.identity,
    discovery: { enabled: config.discoveryEnabled || false, asLocalhost: config.asLocalhost || true }
  });

  const network = await gateway.getNetwork(config.channelName);
  const contract = contractName ? network.getContract(config.chaincodeName, contractName) : network.getContract(config.chaincodeName);
  return { gateway, contract };
}

/**
 * Submit a transaction to the blockchain (write)
 * @param {string} fn - chaincode function name
 * @param {Array} args - arguments to function
 * @param {string} contractName - optional contract within chaincode package
 */
async function submitTransaction(fn, args, contractName) {
  const { gateway, contract } = await getContract(contractName);
  try {
    const result = await contract.submitTransaction(fn, ...args);
    return result.toString();
  } finally {
    gateway.disconnect();
  }
}

/**
 * Evaluate a transaction (read-only)
 */
async function evaluateTransaction(fn, args, contractName) {
  const { gateway, contract } = await getContract(contractName);
  try {
    const result = await contract.evaluateTransaction(fn, ...args);
    return result.toString();
  } finally {
    gateway.disconnect();
  }
}

module.exports = {
  getContract,
  submitTransaction,
  evaluateTransaction
};
