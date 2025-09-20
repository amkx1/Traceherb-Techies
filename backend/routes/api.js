const express = require('express');
const router = express.Router();
const { submitTransaction, evaluateTransaction } = require('../fabric/index');
const recallRoutes = require('./recallRoutes');
const fileRoutes = require('./fileRoutes');
const aiRoutes = require('./aiRoutes'); // <-- Import the new AI routes


/**
 * Register a new product
 * Body params: { farmerPhone, productType, quantity, quality }
 */
router.post('/register', async (req, res) => {
  const { farmerPhone, productType, quantity, quality } = req.body;

  if (!farmerPhone || !productType || !quantity || !quality) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await submitTransaction('registerProduct', [
      farmerPhone,
      productType,
      quantity,
      quality
    ]);

    res.json({ success: true, message: 'Product registered successfully', tx: response });
  } catch (err) {
    console.error('Error registering product:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get product status
 * URL param: /status/:productId
 */
router.get('/status/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const status = await evaluateTransaction('getProductStatus', [productId]);
    res.json({ success: true, status });
  } catch (err) {
    console.error('Error fetching status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register the routes
router.use('/recall', recallRoutes);
router.use('/files', fileRoutes);
router.use('/ai', aiRoutes); // <-- Add this line

module.exports = router;
