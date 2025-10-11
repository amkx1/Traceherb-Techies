// routes/n8nRoutes.js
const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/n8nController");

// Webhook endpoint for n8n
router.post("/webhook", handleWebhook);

module.exports = router;
