const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

// Request OTP
router.post("/otp", async (req, res) => {
  try {
    const result = await controller.requestOtp(req, res);

    // If controller already handled response, stop here
    if (res.headersSent) return;

    res.json({
      success: true,
      data: result || "OTP sent"
    });
  } catch (err) {
    console.error("❌ OTP request failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to request OTP"
    });
  }
});

// Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const result = await controller.verifyOtp(req, res);

    if (res.headersSent) return;

    res.json({
      success: true,
      data: result || "OTP verified"
    });
  } catch (err) {
    console.error("❌ OTP verification failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "OTP verification failed"
    });
  }
});

module.exports = router;
