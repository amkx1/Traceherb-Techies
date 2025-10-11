const express = require("express");
const router = express.Router();
const controller = require("../controllers/labController");
const multer = require("multer");

// Configure multer (in-memory, 10MB max file size)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Upload lab test report
router.post("/tests", (req, res, next) => {
  upload.single("reportFile")(req, res, (err) => {
    if (err) {
      console.error("❌ Lab file upload failed:", err.message);
      return res
        .status(400)
        .json({ success: false, error: "File upload error: " + err.message });
    }

    try {
      controller.uploadTest(req, res);
    } catch (err) {
      console.error("❌ Lab test processing failed:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
});

module.exports = router;
