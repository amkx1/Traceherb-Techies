

const axios = require("axios");
const BLOCKCHAIN_URL = "http://127.0.0.1:5000";

async function addCropTransaction(data) {
  try {
    await axios.post(`${BLOCKCHAIN_URL}/transaction/crop`, data);
    await axios.get(`${BLOCKCHAIN_URL}/mine`);
    console.log("🌾 Crop transaction recorded:", data);
  } catch (err) {
    console.error("❌ Crop blockchain error:", err.message);
  }
}

async function addVoiceTransaction(data) {
  try {
    await axios.post(`${BLOCKCHAIN_URL}/transaction/voice`, data);
    await axios.get(`${BLOCKCHAIN_URL}/mine`);
    console.log("🎤 Voice transaction recorded:", data);
  } catch (err) {
    console.error("❌ Voice blockchain error:", err.message);
  }
}

module.exports = { addCropTransaction, addVoiceTransaction };
