const { submitTransaction } = require('../fabric/invoke');
const { v4: uuidv4 } = require('uuid');
const store = {};
exports.createHarvest = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.farmerId || !payload.species || !payload.weightKg) return res.status(400).json({ error: 'missing fields' });
    const id = uuidv4();
    const harvestObj = {
      id,
      farmerId: payload.farmerId,
      species: payload.species,
      weightKg: payload.weightKg,
      coords: payload.coords || null,
      timestamp: payload.timestamp || new Date().toISOString(),
      clientId: payload.clientId || null,
    };
    store[id] = harvestObj;
    try {
      const result = await submitTransaction('CreateHarvest', [JSON.stringify(harvestObj)]);
      return res.json({ status: 'submitted', id, result });
    } catch (err) {
      console.error(err);
      return res.json({ status: 'queued', id, error: err.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getHarvest = async (req, res) => {
  const id = req.params.id;
  if (store[id]) return res.json(store[id]);
  return res.status(404).json({ error: 'not found' });
};
// expose store for other modules if needed
exports.__getStore = () => store;
