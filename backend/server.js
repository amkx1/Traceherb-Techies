const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const net = require('net');

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
