const express = require("express");
const router = express.Router();
const controller = require("../controllers/provenanceController");

// Fetch provenance for a specific batch
router.get("/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: "Batch ID is required",
      });
    }

    const provenance = await controller.getProvenanceForBatch(batchId);

    res.json({
      success: true,
      data: provenance,
    });
  } catch (err) {
    console.error("❌ Provenance fetch failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch provenance data",
    });
  }
});

module.exports = router;
