const express = require("express");
const router = express.Router();
const harvestController = require("../controllers/harvestController");

// Create a new harvest record
router.post("/", async (req, res) => {
  try {
    const result = await harvestController.createHarvest(req, res);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Harvest creation failed:", err.message);
    res.status(500).json({ success: false, error: "Failed to create harvest" });
  }
});

// Get a specific harvest by ID
router.get("/:id", async (req, res) => {
  try {
    const harvest = await harvestController.getHarvest(req, res);
    res.json({ success: true, data: harvest });
  } catch (err) {
    console.error("❌ Failed to fetch harvest:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch harvest" });
  }
});

// (Optional) Support GET /api/harvest/all for dashboard
router.get("/all/data", async (req, res) => {
  try {
    const harvests = await harvestController.getAllHarvests
      ? await harvestController.getAllHarvests(req, res)
      : [];
    res.json({ success: true, data: harvests });
  } catch (err) {
    console.error("❌ Failed to fetch all harvests:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch harvests" });
  }
});

module.exports = router;
