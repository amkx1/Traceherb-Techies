// controllers/n8nController.js
exports.handleWebhook = async (req, res) => {
  try {
    console.log("Webhook received from n8n:", req.body);

    // Example: process data from n8n workflow
    const { event, data } = req.body;

    if (event === "user_signup") {
      // Handle signup event
      console.log("New user:", data);
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
