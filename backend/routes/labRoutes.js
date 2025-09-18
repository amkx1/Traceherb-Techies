const express = require('express');
const router = express.Router();
const controller = require('../controllers/labController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.post('/tests', upload.single('reportFile'), controller.uploadTest);
module.exports = router;
