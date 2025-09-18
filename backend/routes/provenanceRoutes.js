const express = require('express');
const router = express.Router();
const controller = require('../controllers/provenanceController');
router.get('/:batchId', controller.getProvenanceForBatch);
module.exports = router;
