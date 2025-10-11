const express = require("express");
const router = express.Router();
const axios = require("axios");

// Recall data from blockchain
router.get("/recall", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/chain");
    res.json(response.data);
  } catch (err) {
    console.error("❌ Recall failed:", err.message);
    res.status(500).json({ error: "Blockchain may be offline" });
  }
});

module.exports = router;
