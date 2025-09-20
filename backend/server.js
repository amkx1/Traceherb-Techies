require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const net = require('net');
const fs = require('fs-extra');

const { getContract } = require('./fabric'); // make sure fabric/index.js exports getContract
const { sendSMS } = require('./utils/sms'); // path to your sms.js

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

// ✅ SMS webhook (farmers can send SMS without app)
app.post('/sms', async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || '';
  const fromNumber = req.body.From || 'unknown';

  console.log(`📩 SMS received from ${fromNumber}: ${incomingMsg}`);

  const parts = incomingMsg.split(' ');
  if (parts.length < 2) {
    res.type('text/xml');
    return res.send(`<Response><Message>❌ Format: SPECIES WEIGHT</Message></Response>`);
  }

  const species = parts[0].toUpperCase();
  const weight = parseFloat(parts[1]);

  if (isNaN(weight)) {
    res.type('text/xml');
    return res.send(`<Response><Message>❌ Invalid weight. Example: TURMERIC 50</Message></Response>`);
  }

  try {
    // 👉 Submit to Fabric
    const { gateway, contract } = await getContract();
    await contract.submitTransaction('registerProduct', fromNumber, species, weight.toString(), 'N/A');
    await gateway.disconnect();

    // 👉 Log entry
    const logEntry = {
      phone: fromNumber,
      crop: species,
      quantity: weight,
      timestamp: new Date().toISOString()
    };

    const logFile = path.join(__dirname, 'logs', 'smsLogs.json');
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(await fs.readFile(logFile, 'utf8'));
    }
    logs.push(logEntry);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    console.log('📝 SMS log saved:', logEntry);

    // 👉 Send confirmation SMS
    await sendSMS(fromNumber, `✅ Harvest submitted: ${species} ${weight}kg. Thank you!`);

    // Twilio requires XML reply
    res.type('text/xml');
    res.send(`<Response><Message>✅ Submitted: ${species} ${weight}kg</Message></Response>`);
  } catch (err) {
    console.error('❌ Error handling SMS:', err.message);
    res.type('text/xml');
    res.send(`<Response><Message>❌ Error submitting harvest. Please try again.</Message></Response>`);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TraceHer Backend is running' });
});

// ⚠️ SPA fallback (must come LAST)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-find free port starting from 3000
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
