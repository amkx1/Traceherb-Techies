// routes/api.js
const express = require('express');
const router = express.Router();

// ===== In-memory stores =====
let harvests = [];
let batches = [];
let recalls = [];

// ===== Harvest Routes =====
router.get('/harvest/all', (req, res) => {
  res.json(harvests);
});

router.post('/harvest', (req, res) => {
  const { crop, quantity, location } = req.body;
  if (!crop || !quantity || !location) {
    return res.status(400).json({ error: "crop, quantity, and location are required" });
  }

  const harvest = { crop, quantity, location, timestamp: new Date().toISOString() };
  harvests.push(harvest);

  console.log("🌾 Harvest Added:", harvest);
  res.json({ message: "🌾 Harvest successfully added", harvest });
});

// ===== Batch Routes =====
router.get('/batch/all', (req, res) => {
  res.json(batches);
});

router.post('/batch', (req, res) => {
  const { harvestId, processor, status } = req.body;
  if (!harvestId || !processor || !status) {
    return res.status(400).json({ error: "harvestId, processor, and status are required" });
  }

  const batch = { harvestId, processor, status, timestamp: new Date().toISOString() };
  batches.push(batch);

  console.log("📦 Batch Added:", batch);
  res.json({ message: "📦 Batch successfully added", batch });
});

// ===== Recall Routes =====
router.get('/recall/all', (req, res) => {
  res.json(recalls);
});

router.post('/recall', (req, res) => {
  const { batchId, reason } = req.body;
  if (!batchId || !reason) {
    return res.status(400).json({ error: "batchId and reason are required" });
  }

  const recall = { batchId, reason, timestamp: new Date().toISOString() };
  recalls.push(recall);

  console.log("♻️ Recall Added:", recall);
  res.json({ message: "♻️ Recall successfully added", recall });
});

module.exports = router;
