const fabricClient = require('../FabricClient');

// Example mock DB lookup for collector by phone
const collectorsDB = {
  '+919876543210': 'collector-001',
  '+919812345678': 'collector-002',
};

function getCollectorIdByPhone(phone) {
  return collectorsDB[phone] || null;
}

// POST /api/sms/collections
exports.smsCollection = async (req, res) => {
  try {
    const { phone, species, latitude, longitude, quantity, timestamp } = req.body;

    if (!phone || !species || !latitude || !longitude || !quantity || !timestamp) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const collectorId = getCollectorIdByPhone(phone);
    if (!collectorId) {
      return res.status(404).json({ error: 'Collector not found for phone number' });
    }

    const event = {
      collectorId: collectorId,
      species: species,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      quantity: parseFloat(quantity),
      unit: 'kg', // or adapt if unit sent via SMS
      quality: {}, // You could extend to accept simple quality params via SMS if desired
      timestamp: timestamp,
      recordedAt: new Date().toISOString(),
    };

    await fabricClient.submitTransaction('RecordCollectionEvent', JSON.stringify(event));

    res.json({ success: true, eventId: event.eventId || null });
  } catch (err) {
    console.error('SMS Collection ingestion error:', err);
    res.status(500).json({ error: 'Failed to record collection event' });
  }
};
