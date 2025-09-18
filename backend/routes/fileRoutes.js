const express = require('express');
const router = express.Router();
router.get('/signed/:key', (req, res) => {
  const key = req.params.key;
  // In production generate presigned URL; here return a demo URL or S3 path
  res.json({ url: process.env.S3_BUCKET ? `https://s3.amazonaws.com/${process.env.S3_BUCKET}/${key}` : `https://example.com/files/${key}` });
});
module.exports = router;
