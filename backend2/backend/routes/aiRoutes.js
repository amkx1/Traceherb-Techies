// controllers/aiController.js

exports.queryBlockchain = async (req, res) => {
  try {
    const { question, batchId } = req.body;

    // Example mock response (replace with real logic/AI call)
    const answer = `Answer for "${question}" on batch ${batchId}`;

    return res.json({
      success: true,
      data: { question, batchId, answer }
    });
  } catch (err) {
    console.error("AI Query Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to query AI"
    });
  }
};
