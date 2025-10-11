const { submitTransaction, evaluateTransaction } = require('./index');

// mock invoke.js for testing without blockchain

exports.submitTransaction = async (fn, args) => {
  console.log(`[MOCK] submitTransaction called with fn=${fn}, args=${JSON.stringify(args)}`);
  return { status: "mocked", fn, args };
};

exports.evaluateTransaction = async (fn, args) => {
  console.log(`[MOCK] evaluateTransaction called with fn=${fn}, args=${JSON.stringify(args)}`);
  
  if (fn === "GetRecall") {
    return JSON.stringify({
      recallId: args[0],
      batchIds: ["BATCH123", "BATCH456"],
      reason: "Pesticide contamination detected",
      issuedBy: "FarmerCoop1",
      issuedAt: new Date().toISOString()
    });
  }

  return JSON.stringify({ message: "Mocked evaluateTransaction result" });
};

module.exports = { submitTransaction, evaluateTransaction };
