const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/query', aiController.queryBlockchain);

module.exports = router;