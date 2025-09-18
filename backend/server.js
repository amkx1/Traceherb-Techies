const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const ivrRoutes = require('./routes/ivr'); // 🆕 for toll-free IVR calls

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Register routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/ivr', ivrRoutes); // 🆕 mount IVR route

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TraceHer Backend is running ' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
