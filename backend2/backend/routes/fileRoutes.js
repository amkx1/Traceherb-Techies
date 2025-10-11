const express = require("express");
const router = express.Router();

router.get("/signed/:key", async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) {
      return res.status(400).json({ success: false, error: "File key is required" });
    }

    // In production, generate a presigned URL with AWS SDK or similar
    const url = process.env.S3_BUCKET
      ? `https://s3.amazonaws.com/${process.env.S3_BUCKET}/${key}`
      : `https://example.com/files/${key}`;

    res.json({ success: true, data: { url } });
  } catch (err) {
    console.error("❌ File URL generation failed:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate file URL" });
  }
});

module.exports = router;
