const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'app.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}`;
  console.log(fullMessage);
  fs.appendFileSync(logPath, fullMessage + '\n', 'utf8');
}

function error(message) {
  log(`ERROR: ${message}`);
}

module.exports = {
  log,
  error
};
