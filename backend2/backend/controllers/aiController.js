const { evaluateTransaction } = require('../fabric/invoke');

// URL for the AI microservice
const AI_SERVICE_URL = 'http://localhost:4000/query';

exports.queryBlockchain = async (req, res) => {
  const { question, batchId } = req.body;

  if (!question || !batchId) {
    return res.status(400).json({ error: 'A "question" and "batchId" are required.' });
  }

  let context = '';
  try {
    // 1. Fetch data from the blockchain to use as context
    const result = await evaluateTransaction('GetBatchProvenance', [batchId]);
    context = result.toString();
  } catch (err) {
    console.warn(`Could not get provenance for ${batchId}: ${err.message}`);
    return res.status(404).json({ error: `Could not find data for batch ${batchId}.` });
  }

  try {
    // 2. Call the AI microservice API with the question and context
    const aiResponse = await fetch(AI_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI service returned an error: ${aiResponse.statusText}`);
    }

    const { answer } = await aiResponse.json();

    // 3. Return the AI's answer to the user
    res.json({ question, batchId, answer });

  } catch (error) {
    console.error('Error calling AI service:', error);
    res.status(500).json({ error: 'Failed to communicate with the AI service.' });
  }
};