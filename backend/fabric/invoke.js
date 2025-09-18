const { getContract } = require('./gateway');

async function submitTransaction(fnName, args = []) {
  const { gateway, contract } = await getContract();
  try {
    console.log(`Submitting tx ${fnName} ${JSON.stringify(args)}`);
    const result = await contract.submitTransaction(fnName, ...args);
    await gateway.disconnect();
    return result.toString();
  } catch (err) {
    await gateway.disconnect();
    throw err;
  }
}

async function evaluateTransaction(fnName, args = []) {
  const { gateway, contract } = await getContract();
  try {
    console.log(`Evaluating tx ${fnName} ${JSON.stringify(args)}`);
    const result = await contract.evaluateTransaction(fnName, ...args);
    await gateway.disconnect();
    return result.toString();
  } catch (err) {
    await gateway.disconnect();
    throw err;
  }
}

module.exports = { submitTransaction, evaluateTransaction };
