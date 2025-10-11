import axios from "axios";

const BLOCKCHAIN_URL = "http://127.0.0.1:5000";

// Send crop transaction
export async function addCropTransaction(data) {
  try {
    const res = await axios.post(`${BLOCKCHAIN_URL}/transaction/crop`, data);

    // Auto-mine right after transaction
    await axios.get(`${BLOCKCHAIN_URL}/mine`);

    return res.data;
  } catch (err) {
    console.error("❌ Error adding crop transaction:", err.message);
    throw err;
  }
}

// Send voice transaction
export async function addVoiceTransaction(data) {
  try {
    const res = await axios.post(`${BLOCKCHAIN_URL}/transaction/voice`, data);

    // Auto-mine right after transaction
    await axios.get(`${BLOCKCHAIN_URL}/mine`);

    return res.data;
  } catch (err) {
    console.error("❌ Error adding voice transaction:", err.message);
    throw err;
  }
}

// Fetch full blockchain
export async function getBlockchain() {
  try {
    const res = await axios.get(`${BLOCKCHAIN_URL}/chain`);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching blockchain:", err.message);
    throw err;
  }
}
