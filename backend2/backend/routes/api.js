const express = require("express");
const router = express.Router();
const axios = require("axios");

// Recall data from blockchain
router.get("/recall", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/chain");

    // Validate response is JSON
    if (typeof response.data !== "object") {
      return res.status(500).json({
        success: false,
        error: "Blockchain returned invalid response (not JSON)"
      });
    }

    return res.json({
      success: true,
      data: response.data
    });
  } catch (err) {
    console.error("❌ Recall failed:", err.message);
    return res.status(500).json({
      success: false,
      error: "Blockchain may be offline"
    });
  }
});

module.exports = router;
