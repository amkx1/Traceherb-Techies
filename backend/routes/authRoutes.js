const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
router.post('/otp', controller.requestOtp);
router.post('/verify', controller.verifyOtp);
module.exports = router;
