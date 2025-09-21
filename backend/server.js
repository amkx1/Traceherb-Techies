require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const net = require('net');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
// const ivrRoutes = require('./routes/ivr'); // optional

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Register backend routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
// app.use('/ivr', ivrRoutes); // optional

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TraceHer Backend is running' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Telegram Bot Integration =====
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// In-memory storage
const verifiedPhones = {};
const otpStore = {};
const farmerData = [];
const voiceData = [];

// ===== Handle incoming voice messages =====
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;

  const file = await bot.getFileLink(fileId);
  const filePath = `voice_${Date.now()}.oga`;

  const axios = require('axios');
  const writer = fs.createWriteStream(filePath);
  const response = await axios({ url: file, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);

  writer.on('finish', () => {
    voiceData.push({ farmer: chatId, recording: filePath, timestamp: new Date().toISOString() });
    console.log('📢 Voice Message Received:', {
      farmer: chatId,
      recording: filePath,
      timestamp: new Date().toISOString()
    });
    bot.sendMessage(chatId, "✅ Voice input received and stored.");
  });
});

// ===== Handle text messages (OTP / crop info) =====
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // OTP verification
  if (!verifiedPhones[chatId]) {
    if (otpStore[chatId] && text === otpStore[chatId]) {
      verifiedPhones[chatId] = true;
      delete otpStore[chatId];
      bot.sendMessage(chatId, "✅ OTP verified! You can now send crop info or voice messages.");
    } else {
      const otp = otpStore[chatId] || Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[chatId] = otp;
      bot.sendMessage(chatId, `🔑 Your OTP is: ${otp}\nPlease enter this OTP to verify.`);
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
    bot.sendMessage(chatId, `✅ Received crop info: ${crop} (${qty}) in ${loc}`);
  }
});

// ===== Endpoint to view all received data =====
app.get('/farmer-data', (req, res) => {
  res.json({ sms: farmerData, voice: voiceData });
});

// ===== Auto-find free port starting from 3000 =====
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

(async () => {
  const port = await findFreePort(3000);
  app.listen(port, () => {
    console.log(`✅ Backend server running on port ${port}`);
    console.log(`🌐 Open your dashboard at http://localhost:${port}/`);
  });
})();
