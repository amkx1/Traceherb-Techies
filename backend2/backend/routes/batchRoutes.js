const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batchController");

// Create new batch
router.post("/", async (req, res) => {
  try {
    const result = await batchController.createBatch(req, res);

    if (res.headersSent) return;
    res.json({ success: true, data: result || "Batch created" });
  } catch (err) {
    console.error("❌ Batch creation failed:", err.message);
    res.status(500).json({ success: false, error: err.message || "Failed to create batch" });
  }
});

// Get all batches
router.get("/all", async (req, res) => {
  try {
    const result = await batchController.getAllBatches?.(req, res);

    if (res.headersSent) return;
    res.json({ success: true, data: result || [] });
  } catch (err) {
    console.error("❌ Fetching all batches failed:", err.message);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch batches" });
  }
});

// Get batch by ID (must be last to avoid conflict with /all)
router.get("/:id", async (req, res) => {
  try {
    const result = await batchController.getBatch(req, res);

    if (res.headersSent) return;
    res.json({ success: true, data: result || null });
  } catch (err) {
    console.error("❌ Fetching batch failed:", err.message);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch batch" });
  }
});

module.exports = router;
