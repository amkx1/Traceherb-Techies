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
  
  console.log(`IVR call from ${phone} with input: ${digits}`);

  try {
    // Process input through session manager
    const { message } = await processIVRInput(phone, digits);

    // Respond to Twilio with XML (TwiML)
    res.type('text/xml');
    res.send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>${message}</Say>
        <Gather timeout="10" numDigits="10">
          <Say>Please enter your response.</Say>
        </Gather>
      </Response>
    `);

  } catch (err) {
    console.error('IVR error:', err.message);
    res.type('text/xml');
    res.send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>An error occurred. Please try again later.</Say>
      </Response>
    `);
  }
});

module.exports = router;
