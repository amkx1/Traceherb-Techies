// routes/recallRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/recallController');
const axios = require('axios');

// Create a new recall (writes to Fabric + broadcasts to FireFly)
router.post('/', controller.createRecall);

// Get a recall by ID (from Fabric)
router.get('/:id', controller.getRecall);

// Get all recall messages from FireFly
router.get('/all', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.FIREFLY_API}/messages`,
      {
        auth: {
          username: process.env.FIREFLY_USERNAME,
          password: process.env.FIREFLY_PASSWORD
        }
      }
    );

    // Filter only messages with tag = "recall"
    const recallMessages = response.data.filter(
      msg => msg.header?.tag === 'recall'
    );

    res.json(recallMessages);
  } catch (err) {
    console.error('❌ Error fetching recallAll:', err.message);
    res.status(500).json({ error: 'Failed to fetch recall messages from FireFly' });
  }
});

module.exports = router;
