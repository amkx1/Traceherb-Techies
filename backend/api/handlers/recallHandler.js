const fabricClient = require('../FabricClient');
const notify = require('../utils/notify'); // Your implementation

exports.recallBatch = async (req, res) => {
  const batchId = req.params.batchId;
  // Mark batch as recalled on chain
  try {
    await fabricClient.submitTransaction('RecallBatch', batchId);
    // Lookup consumers from DB who scanned this batch (Implement this)
    const affectedUsers = await getUsersByBatchScan(batchId);

    // Notify users off-chain 
    for (const user of affectedUsers) {
      await notify(user.contact, `Recall notice for batch ${batchId}`);
    }

    res.json({ success: true, notifiedCount: affectedUsers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
