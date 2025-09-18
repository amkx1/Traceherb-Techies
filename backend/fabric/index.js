const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const config = require('../config/fabricConfig.json');

/**
 * Connect to Fabric and get a contract object
 */
async function getContract() {
  const ccpPath = path.resolve(__dirname, '..', config.connectionProfilePath);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const walletPath = path.resolve(__dirname, '..', config.walletPath);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: config.identity,
    discovery: { enabled: true, asLocalhost: true }
  });

  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract(config.chaincodeName);

  return { gateway, contract };
}

/**
 * Submit a transaction to the blockchain (write)
 * @param {string} fn - chaincode function name
 * @param {Array} args - arguments to function
 */
async function submitTransaction(fn, args) {
  const { gateway, contract } = await getContract();
  try {
    const result = await contract.submitTransaction(fn, ...args);
    return result.toString();
  } finally {
    gateway.disconnect();
  }
}

/**
 * Evaluate a transaction (read-only)
 * @param {string} fn - chaincode function name
 * @param {Array} args - arguments to function
 */
async function evaluateTransaction(fn, args) {
  const { gateway, contract } = await getContract();
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
