'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fabricClient = require('./FabricClient');

const collectorHandler = require('./handlers/collectorHandler');
const collectionHandler = require('./handlers/collectionHandler');
const provenanceHandler = require('./handlers/provenanceHandler');
const qrHandler = require('./handlers/qrHandler');
const recallHandler = require('./handlers/recallHandler');
const smsCollectionHandler = require('./handlers/smsCollectionHandler');

const { authenticate, authorize } = require('./auth');

async function main() {
  const app = express();

  app.use(bodyParser.json());

  // Initialize Fabric client
  await fabricClient.initFabric();

  // Authentication Middleware (apply as needed)
  app.use(authenticate);

  // Routes
  app.post('/api/collectors', authorize('admin'), collectorHandler.registerCollector);
  app.post('/api/collections', authorize('collector'), collectionHandler.createCollection);
  app.post('/api/sms/collections', smsCollectionHandler.smsCollection); // open or with phone/token validation
  app.get('/api/collections/:collectionId', authorize('collector'), collectionHandler.getCollection);
  app.get('/api/provenance/:batchId', provenanceHandler.getProvenance);
  app.get('/api/qrcode/:batchId', qrHandler.generateQRCode);
  app.post('/api/recall/:batchId', authorize('admin'), recallHandler.recallBatch);

  // Error handler
  app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
}

main().catch(console.error);
