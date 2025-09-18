const express = require('express');
const router = express.Router();
const controller = require('../controllers/batchController');
router.post('/', controller.createBatch);
router.get('/:id', controller.getBatch);
module.exports = router;
