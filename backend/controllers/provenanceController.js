const { evaluateTransaction } = require('../fabric/invoke');
exports.getProvenanceForBatch = async (req, res) => {
  const { batchId } = req.params;
  try {
    const result = await evaluateTransaction('GetBatchProvenance', [batchId]);
    return res.json({ batchId, provenance: JSON.parse(result) });
  } catch (err) {
    console.warn('fabric evaluate failed, returning demo data', err.message);
    const demo = {
      bundleType: 'ProvenanceBundle',
      batchId,
      chainOfCustody: [
        { event: 'collected', actor: 'farmer-234', time: '2025-09-17T10:00:00Z', details: { weightKg: 12.5 } },
        { event: 'aggregated', actor: 'collector-1', time: '2025-09-17T12:00:00Z', details: { batchId } },
        { event: 'tested', actor: 'lab-01', time: '2025-09-18T09:00:00Z', details: { reportUrl: 'https://example.com/report.pdf' } }
      ]
    };
    return res.json({ batchId, provenance: demo });
  }
};
