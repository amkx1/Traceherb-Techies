const { getContract } = require('./index');

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
  submitTransaction,
  evaluateTransaction
};
