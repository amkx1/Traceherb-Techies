// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const net = require('net');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ===== Import routes =====
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ===== Serve frontend =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== Backend routes =====
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// ===== Root endpoint =====
app.get('/', (req, res) => {
  res.json({ message: 'TraceHer Backend is running 🚀' });
});

// ===== SPA fallback =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Telegram Bot Integration =====
if (process.env.TELEGRAM_BOT_TOKEN) {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  // In-memory storage
  const verifiedPhones = {};
  const otpStore = {};
  const farmerData = [];
  const voiceData = [];

  // Handle voice messages
  bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.voice.file_id;

    try {
      const file = await bot.getFileLink(fileId);
      const filePath = `voice_${Date.now()}.oga`;

      const writer = fs.createWriteStream(filePath);
      const response = await axios({ url: file, method: 'GET', responseType: 'stream' });
      response.data.pipe(writer);

      writer.on('finish', async () => {
        const entry = { farmer: chatId, recording: filePath, timestamp: new Date().toISOString() };
        voiceData.push(entry);

        console.log('📢 Voice Message Received:', entry);

        // 🔗 Send voice data to blockchain
        try {
          const bcRes = await axios.post("http://127.0.0.1:5000/transaction/voice", entry);
          console.log("✅ Voice added to blockchain:", bcRes.data);
        } catch (err) {
          console.error("❌ Blockchain offline (voice):", err.message);
        }

        bot.sendMessage(chatId, "✅ Voice input received and stored.");
      });
    } catch (err) {
      console.error("❌ Failed to process voice message:", err.message);
    }
  });

  // Handle text messages (OTP / crop info)
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return; // ignore non-text

    // OTP verification
    if (!verifiedPhones[chatId]) {
      if (otpStore[chatId] && text === otpStore[chatId]) {
        verifiedPhones[chatId] = true;
        delete otpStore[chatId];
        bot.sendMessage(chatId, "✅ OTP verified! You can now send crop info or voice messages.");
      } else if (!otpStore[chatId]) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[chatId] = otp;
        bot.sendMessage(chatId, `🔑 Your OTP is: ${otp}\nPlease enter this OTP to verify.`);
      } else {
        bot.sendMessage(chatId, "❌ Invalid OTP. Please try again.");
      }
      return;
    }

    // Crop info format: CROP Wheat QTY 50kg LOC Bihar
    const crop = (text.match(/CROP\s+(.*?)\s+/i) || [])[1] || '';
    const qty = (text.match(/QTY\s+(.*?)\s+/i) || [])[1] || '';
    const loc = (text.match(/LOC\s+(.*?)$/i) || [])[1] || '';

    if (crop && qty && loc) {
      const entry = { farmer: chatId, crop, quantity: qty, location: loc, timestamp: new Date().toISOString() };
      farmerData.push(entry);
      console.log('🌾 Crop Info Received:', entry);

      // 🔗 Send crop info to blockchain
      axios.post("http://127.0.0.1:5000/transaction/crop", entry)
        .then(res => {
          console.log("✅ Crop added to blockchain:", res.data);
        })
        .catch(err => {
          console.error("❌ Blockchain offline (crop):", err.message);
        });

      bot.sendMessage(chatId, `✅ Received crop info: ${crop} (${qty}) in ${loc}`);
    } else {
      bot.sendMessage(chatId, "❗ Please use format: CROP <name> QTY <amount> LOC <place>");
    }
  });

  // Endpoint to view all received farmer data
  app.get('/farmer-data', (req, res) => {
    res.json({ sms: farmerData, voice: voiceData });
  });

  // Telegram Polling Error Handler
  bot.on("polling_error", (err) => {
    console.error("❌ Telegram Polling Error:", err.code, err.message);
  });
}

// ===== Auto-find free port =====
function findFreePort(start = 3000) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(start, () => {
      server.once('close', () => resolve(start));
      server.close();
    });
    server.on('error', () => resolve(findFreePort(start + 1)));
  });
}

// ===== Start Server =====
(async () => {
  const port = await findFreePort(3000);
  app.listen(port, () => {
    console.log(`✅ Backend server running on port ${port}`);
    console.log(`🌐 Open your dashboard at http://localhost:${port}/`);
  });
})();
