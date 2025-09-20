const { submitTransaction, evaluateTransaction } = require('./index');

/**
 * Thin wrapper kept for backward compatibility.
 * Usage:
 *  submitTransaction(fn, args, contractName)
 *  evaluateTransaction(fn, args, contractName)
 */
module.exports = { submitTransaction, evaluateTransaction };
