const { submitTransaction } = require('../fabric/invoke');
const AWS = require('aws-sdk');
// Configure AWS SDK via env vars for S3 (or use MinIO). For demo this will skip upload if not configured.
const s3 = new AWS.S3({ region: process.env.AWS_REGION });
exports.uploadTest = async (req, res) => {
  try {
    const { batchId, labId, results } = req.body;
    let reportUrl = null;
    if (req.file && process.env.S3_BUCKET) {
      const key = `lab_reports/${Date.now()}_${req.file.originalname}`;
      await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: key, Body: req.file.buffer }).promise();
      reportUrl = `s3://${process.env.S3_BUCKET}/${key}`;
    }
    const testObj = { id: `lab-${Date.now()}`, batchId, labId, results: results ? JSON.parse(results) : {}, reportUrl };
    try {
      const result = await submitTransaction('SubmitLabTest', [JSON.stringify(testObj)]);
      return res.json({ status: 'submitted', result, testObj });
    } catch (err) {
      console.error(err);
      return res.json({ status: 'queued', testObj, error: err.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
