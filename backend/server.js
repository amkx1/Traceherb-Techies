const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const net = require('net');
const axios = require('axios');

// ===== Local blockchain and webhook URLs =====
const BLOCKCHAIN_URL = 'http://127.0.0.1:5000/add_transaction';
const N8N_WEBHOOK_URL = 'https://n8n-latest-ms7n.onrender.com/webhook/Amrendra-Backend-testing'; // Example webhook

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

// ===== Send dummy data to n8n webhook on first run =====
async function sendInitialWebhook() {
  const dummyData = {
    farmer: 'TestFarmer',
    crop: 'Wheat',
    quantity: '1000kg',
    location: 'Andhra Pradesh',
    timestamp: new Date().toISOString(),
    note: '🌾 Initial test data from TraceHer backend'
  };

  try {
    const res = await axios.post(N8N_WEBHOOK_URL, dummyData);
    console.log('📨 Sent initial dummy data to n8n webhook:', res.status);
  } catch (err) {
    console.warn('⚠️ Could not send dummy data to webhook:', err.message);
  }
}

// ===== Main startup function =====
async function startServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(express.static(path.join(__dirname, 'public')));

  // ===== Routes =====
  const authRoutes = require('./routes/authRoutes');
  const apiRoutes = require('./routes/api');
  const fireflyRoutes = require('./routes/fireflyRoutes');
  const n8nRoutes = require('./routes/n8nRoutes');

  app.use('/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use('/firefly', fireflyRoutes);
  app.use('/n8n', n8nRoutes);

  app.get('/', (req, res) => res.json({ message: 'TraceHer Backend is running 🚀' }));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  // ===== In-memory storage =====
  const farmerData = [];
  const voiceData = [];

  // ===== Crop submission endpoint =====
  app.post('/submit-crop', async (req, res) => {
    const { farmer, crop, quantity, location } = req.body;

    if (!farmer || !crop || !quantity || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = { farmer, crop, quantity, location, timestamp: new Date().toISOString() };
    farmerData.push(entry);

    try {
      // Add to blockchain
      await axios.post(BLOCKCHAIN_URL, entry);
      console.log('✅ Added to blockchain:', entry);

      // Send to n8n webhook
      await axios.post(N8N_WEBHOOK_URL, entry);
      console.log('📨 Sent data to n8n webhook');

      res.json({ success: true, message: 'Data sent to blockchain and webhook successfully!' });
    } catch (err) {
      console.error('❌ Error while forwarding data:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===== Farmer data endpoint =====
  app.get('/farmer-data', (req, res) => res.json({ sms: farmerData, voice: voiceData }));

  // ===== Start server =====
  const port = await findFreePort(3000);
  app.listen(port, async () => {
    console.log(`✅ Backend server running on port ${port}`);
    console.log(`🌐 Open your dashboard at http://localhost:${port}/`);

    // 🔹 Send dummy data on first run
    await sendInitialWebhook();
  });
}

// ===== Launch =====
startServer();
