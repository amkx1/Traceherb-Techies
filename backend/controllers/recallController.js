const { submitTransaction } = require('../fabric/invoke');
const store = {};
exports.createRecall = async (req, res) => {
  try {
    const { batchIds, reason, issuedBy } = req.body;
    if (!Array.isArray(batchIds) || batchIds.length === 0) return res.status(400).json({ error: 'batchIds required' });
    const recallId = `RECALL-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const recall = { recallId, batchIds, reason, issuedBy, issuedAt: new Date().toISOString() };
    store[recallId] = recall;
    try {
      const result = await submitTransaction('CreateRecall', [JSON.stringify(recall)]);
      return res.json({ status: 'submitted', recallId, result });
    } catch (err) {
      console.error(err);
      return res.json({ status: 'queued', recallId, error: err.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getRecall = async (req, res) => {
  const id = req.params.id;
  if (store[id]) return res.json(store[id]);
  return res.status(404).json({ error: 'not found' });
};
