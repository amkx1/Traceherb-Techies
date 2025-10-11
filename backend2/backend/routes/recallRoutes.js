// routes/api.js
const express = require('express');
const router = express.Router();

// Existing routes ...

// ===== Recall Routes =====
let recalls = [];

// Get all recalls
router.get('/recall/all', (req, res) => {
  res.json(recalls);
});

// Add a recall
router.post('/recall', (req, res) => {
  const { batchId, reason } = req.body;

  if (!batchId || !reason) {
    return res.status(400).json({ error: "batchId and reason are required" });
  }

  const recall = {
    batchId,
    reason,
    timestamp: new Date().toISOString(),
  };

  recalls.push(recall);

  console.log("♻️ Recall Added:", recall);

  res.json({
    message: "♻️ Recall successfully added",
    recall
  });
});

module.exports = router;
