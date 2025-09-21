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