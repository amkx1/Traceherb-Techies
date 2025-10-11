// controllers/recallController.js
const { submitTransaction, evaluateTransaction } = require('../fabric/invoke');
const axios = require('axios');

exports.createRecall = async (req, res) => {
  try {
    const { batchIds, reason, issuedBy } = req.body;

    // Validate input
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ error: 'batchIds required' });
    }

    // Generate recall object
    const recallId = `RECALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const recall = {
      recallId,
      batchIds,
      reason,
      issuedBy,
      issuedAt: new Date().toISOString()
    };

    // 1️⃣ Submit recall to Fabric chaincode
    await submitTransaction('CreateRecall', [JSON.stringify(recall)]);

    // 2️⃣ Broadcast recall to FireFly with tag "recall"
    try {
      await axios.post(
        `${process.env.FIREFLY_API}/messages/broadcast`,
        {
          header: { tag: "recall" },
          data: [{ value: JSON.stringify(recall) }]
        },
        {
          auth: {
            username: process.env.FIREFLY_USERNAME,
            password: process.env.FIREFLY_PASSWORD
          }
        }
      );
      console.log("✅ Recall broadcasted to FireFly:", recallId);
    } catch (fireflyErr) {
      console.warn(
        "⚠️ Recall submitted to Fabric but FireFly broadcast failed:",
        fireflyErr.message
      );
    }

    // Respond success
    res.status(201).json({
      message: 'Recall queued for creation',
      recallId,
      status: 'queued'
    });
  } catch (err) {
    console.error("❌ Error creating recall:", err.message);
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
    console.warn(
      `⚠️ Could not get recall ${id} from ledger (is it running?): ${err.message}`
    );
    return res.status(404).json({
      error: `Recall ${id} not found. Blockchain may be offline.`
    });
  }
};
