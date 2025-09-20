const { submitTransaction, evaluateTransaction } = require('../fabric/invoke');
const { sendSMS } = require('../utils/sms');
const { v4: uuidv4 } = require('uuid');

exports.createBatch = async (req, res) => {
  try {
    const { collectionIds, createdBy, notifyPhone } = req.body;
    
    if (!Array.isArray(collectionIds) || collectionIds.length === 0) {
      return res.status(400).json({ error: 'collectionIds (array) required' });
    }
    
    const batchId = `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const batch = { 
      batchId, 
      collectionIds, 
      createdBy, 
      timestamp: new Date().toISOString() 
    };
    
    try {
      await submitTransaction('CreateBatch', [JSON.stringify(batch)]);
      if (notifyPhone) {
        sendSMS(notifyPhone, `Batch ${batchId} created successfully.`);
      }
      res.status(201).json({ message: 'Batch queued for creation', batchId, status: 'queued' });
    } catch (err) {
      console.error(`Fabric submit failed: ${err}`);
      res.status(500).json({ error: `Failed to create batch on ledger: ${err.message}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBatch = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await evaluateTransaction('GetBatch', [id]);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Batch not found on ledger' });
    }
    return res.json(JSON.parse(result.toString()));
  } catch (err) {
    // If blockchain is offline, log the error and return a clear message.
    console.warn(`Could not get batch ${id} from ledger (is it running?): ${err.message}`);
    return res.status(404).json({ error: `Batch ${id} not found. Blockchain may be offline.` });
  }
};
