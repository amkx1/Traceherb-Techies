const { getContract } = require('../fabric'); // fabric/index.js
const { sendSMS } = require('./sms');
const fs = require('fs-extra');
const path = require('path');

const logFile = path.join(__dirname, '..', 'logs', 'ivrLogs.json');
const sessions = {}; // in-memory session tracking

/**
 * Process IVR input step-by-step for a farmer
 * @param {string} phone - Farmer's phone number
 * @param {string} digits - Keypad input
 * @returns {Object} { message, finished }
 */
async function processIVRInput(phone, digits) {
  if (!sessions[phone]) {
    sessions[phone] = { step: 1, data: {} };
  }

  const session = sessions[phone];
  let message = '';
  let finished = false;

  try {
    switch (session.step) {
      case 1:
        message = 'Press 1 for Wheat, 2 for Rice, 3 for Others';
        session.step = 2;
        break;

      case 2:
        session.data.crop =
          digits === '1' ? 'Wheat' : digits === '2' ? 'Rice' : 'Other';
        message = 'Enter quantity in kg followed by #';
        session.step = 3;
        break;

      case 3:
        session.data.quantity = digits;
        message = 'Press 1 for High Quality, 2 for Medium, 3 for Low';
        session.step = 4;
        break;

      case 4:
        session.data.quality =
          digits === '1' ? 'High' : digits === '2' ? 'Medium' : 'Low';

        // Submit to Fabric
        const { gateway, contract } = await getContract();
        await contract.submitTransaction(
          'registerProduct',
          phone,
          session.data.crop,
          session.data.quantity,
          session.data.quality
        );
        await gateway.disconnect();

        // Final message
        message = `Product registered: ${session.data.crop}, ${session.data.quantity}kg, ${session.data.quality}`;
        finished = true;

        // Send SMS confirmation
        await sendSMS(phone, message);

        // Save log entry
        const logEntry = {
          phone,
          crop: session.data.crop,
          quantity: session.data.quantity,
          quality: session.data.quality,
          timestamp: new Date().toISOString()
        };

        let logs = [];
        if (fs.existsSync(logFile)) {
          logs = JSON.parse(await fs.readFile(logFile, 'utf8'));
        }
        logs.push(logEntry);
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        console.log('IVR log saved:', logEntry);

        // Clear session
        delete sessions[phone];
        break;
    }
  } catch (err) {
    console.error('Error in IVR session:', err.message);
    message = 'An error occurred. Please try again later.';
    finished = true;
    delete sessions[phone];
  }

  return { message, finished };
}

module.exports = { processIVRInput };
