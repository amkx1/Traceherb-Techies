const { submitTransaction, evaluateTransaction } = require('../fabric/invoke');
const { v4: uuidv4 } = require('uuid');

exports.createHarvest = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.farmerId || !payload.species || !payload.weightKg) {
      return res.status(400).json({ error: 'farmerId, species, and weightKg are required' });
    }
    
    const id = uuidv4();
    const harvestObj = {
      id,
      ...payload,
      timestamp: new Date().toISOString(),
      clientId: payload.clientId || null,
    };
    
    try {
      await submitTransaction('CreateHarvest', [JSON.stringify(harvestObj)]);
      res.status(201).json({ message: 'Harvest queued for creation', id, status: 'queued' });
    } catch (err) {
      console.error(`Fabric submit failed: ${err}`);
      res.status(500).json({ error: `Failed to create harvest on ledger: ${err.message}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHarvest = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await evaluateTransaction('GetHarvest', [id]);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Harvest not found on ledger' });
    }
    return res.json(JSON.parse(result.toString()));
  } catch (err) {
    // If blockchain is offline, log the error and return a clear message.
    console.warn(`Could not get harvest ${id} from ledger (is it running?): ${err.message}`);
    return res.status(404).json({ error: `Harvest ${id} not found. Blockchain may be offline.` });
  }
};
