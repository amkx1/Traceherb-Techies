const { submitTransaction, evaluateTransaction } = require('../fabric/invoke');
const store = {};
exports.createRecall = async (req, res) => {
  try {
    const { batchIds, reason, issuedBy } = req.body;
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ error: 'batchIds required' });
    }
    
    const recallId = `RECALL-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const recall = { recallId, batchIds, reason, issuedBy, issuedAt: new Date().toISOString() };
    
    try {
      await submitTransaction('CreateRecall', [JSON.stringify(recall)]);
      res.status(201).json({ message: 'Recall queued for creation', recallId, status: 'queued' });
    } catch (err) {
      console.error(`Fabric submit failed: ${err}`);
      res.status(500).json({ error: `Failed to create recall on ledger: ${err.message}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRecall = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await evaluateTransaction('GetRecall', [id]);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Recall not found on ledger' });
    }
    return res.json(JSON.parse(result.toString()));
  } catch (err) {
    // If blockchain is offline, log the error and return a clear message.
    console.warn(`Could not get recall ${id} from ledger (is it running?): ${err.message}`);
    return res.status(404).json({ error: `Recall ${id} not found. Blockchain may be offline.` });
  }
};
