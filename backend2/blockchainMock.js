
// blockchainMock.js
module.exports = {
  submitTransaction: async (txName, ...args) => {
    console.log(`Mock Blockchain: called transaction ${txName} with args:`, args);
    return { success: true, txName, args };
  },
  evaluateTransaction: async (txName, ...args) => {
    console.log(`Mock Blockchain: evaluated transaction ${txName} with args:`, args);
    return { result: "mocked-result", txName, args };
  }
};
