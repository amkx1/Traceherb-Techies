const { submitTransaction } = require('../fabric/invoke');
const { v4: uuidv4 } = require('uuid');
const store = {};
exports.createBatch = async (req, res) => {
  try {
    const { collectionIds, createdBy } = req.body;
    if (!Array.isArray(collectionIds) || collectionIds.length === 0) return res.status(400).json({ error: 'collectionIds required' });
    const batchId = `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const batch = { batchId, collectionIds, createdBy, timestamp: new Date().toISOString() };
    store[batchId] = batch;
    try {
      const result = await submitTransaction('CreateBatch', [JSON.stringify(batch)]);
      return res.json({ status: 'submitted', batchId, result });
    } catch (err) {
      console.error(err);
      return res.json({ status: 'queued', batchId, error: err.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getBatch = async (req, res) => {
  const id = req.params.id;
  if (store[id]) return res.json(store[id]);
  return res.status(404).json({ error: 'not found' });
};
