const express = require('express');
const router = express.Router();
const controller = require('../controllers/harvestController');
router.post('/', controller.createHarvest);
router.get('/:id', controller.getHarvest);
module.exports = router;
