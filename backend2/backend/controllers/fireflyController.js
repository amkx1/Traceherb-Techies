const fireflyClient = require("../utils/fireflyClient");

// Broadcast message
exports.sendBroadcast = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await fireflyClient.post("/api/v1/messages/broadcast", {
      data: [{ value: message }]
    });
    res.json(response.data);
  } catch (err) {
    console.error("FireFly broadcast error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send message to FireFly" });
  }
};

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const response = await fireflyClient.get("/api/v1/messages");
    res.json(response.data);
  } catch (err) {
    console.error("FireFly fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch messages from FireFly" });
  }
};
