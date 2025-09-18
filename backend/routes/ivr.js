const express = require('express');
const router = express.Router();
const { processIVRInput } = require('../utils/session');

/**
 * Twilio will hit this endpoint on incoming IVR calls.
 * It sends us the farmer's phone number (From) and their keypad input (Digits).
 */
router.post('/', async (req, res) => {
  const phone = req.body.From;
  const digits = req.body.Digits;

  try {
    // Process input through session manager
    const { message } = await processIVRInput(phone, digits);

    // Respond to Twilio with XML (TwiML)
    res.type('text/xml');
    res.send(`
      <Response>
        <Say voice="alice">${message}</Say>
        <Pause length="1"/>
        <Gather input="dtmf" timeout="10" numDigits="5" action="/ivr" method="POST"/>
      </Response>
    `);
  } catch (err) {
    console.error('IVR error:', err.message);
    res.type('text/xml');
    res.send(`
      <Response>
        <Say voice="alice">An error occurred. Please try again later.</Say>
        <Hangup/>
      </Response>
    `);
  }
});

module.exports = router;
