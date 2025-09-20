const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// Handles POST requests to /api/batch
router.post('/', batchController.createBatch);

// Handles GET requests to /api/batch/all (as seen in your logs)
// Note: You may need to create a `getAllBatches` function in your controller
// to return real data. This is a placeholder to prevent 404 errors.
router.get('/all', (req, res) => {
  console.log('GET /api/batch/all hit. Returning placeholder [].');
  res.json([]);
});

// Handles GET requests to /api/batch/:id
// IMPORTANT: This route with a parameter must come after specific routes like '/all'.
router.get('/:id', batchController.getBatch);

module.exports = router;
