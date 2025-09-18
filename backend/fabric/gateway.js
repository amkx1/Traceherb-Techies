const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const config = require('../config/fabricConfig.json');

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

module.exports = { getContract };
