import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { pipeline } from '@xenova/transformers';

const app = express();
const port = 4000; // The AI service will run on a different port

app.use(cors());
app.use(bodyParser.json());

// Singleton to hold the AI model pipeline
let qaPipeline = null;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AI Service is running' });
});

// Main QA endpoint that receives a question and context
app.post('/query', async (req, res) => {
  const { question, context } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: 'A "question" and "context" are required.' });
  }

  try {
    // Load the model on the first request
    if (qaPipeline === null) {
      console.log('Loading QA model...');
      qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
      console.log('QA model loaded successfully.');
    }

    const result = await qaPipeline(question, context);
    const answer = result.score > 0.1 ? result.answer : 'Sorry, I could not find an answer in the provided data.';
    
    res.json({ answer });

  } catch (error) {
    console.error('Error during question answering:', error);
    res.status(500).json({ error: 'An error occurred while processing your question.' });
  }
});

app.listen(port, () => {
  console.log(`✅ AI Service listening on http://localhost:${port}`);
});