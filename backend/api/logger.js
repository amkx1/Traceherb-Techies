// logger.js
// Simple logging utility for Node.js backend

const fs = require('fs');
const path = require('path');

// Log messages to console and a file (logs/app.log)
function log(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}`;
  console.log(fullMessage);
  const logPath = path.join(__dirname, 'C:\Users\astro\Desktop\backend\api');
  fs.appendFileSync(logPath, fullMessage + '\n', 'utf8');
}

// Log error messages
function error(message) {
  log(`ERROR: ${message}`);
}

module.exports = {
  log,
  error
};
