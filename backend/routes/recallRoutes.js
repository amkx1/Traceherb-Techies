const express = require('express');
const router = express.Router();
const controller = require('../controllers/recallController');
router.post('/', controller.createRecall);
router.get('/:id', controller.getRecall);
module.exports = router;
