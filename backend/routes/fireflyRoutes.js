const express = require("express");
const router = express.Router();
const fireflyController = require("../controllers/fireflyController");

router.post("/broadcast", fireflyController.sendBroadcast);
router.get("/messages", fireflyController.getMessages);

module.exports = router;
