'use strict';

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fabricClient = require('./FabricClient');

// Import handlers from the handlers folder
const collectorHandler = require('./handlers/collectorHandler');
const collectionHandler = require('./handlers/CollectionHandler');
const provenanceHandler = require('./handlers/ProvenanceHandler');
const qrHandler = require('./handlers/qrHandler');


async function main() {
    const app = express();
    app.use(bodyParser.json());

    // Init Fabric client before accepting requests
    await fabricClient.initFabric();

    // Routes
    app.post('/api/collectors', collectorHandler.registerCollector);
    app.post('/api/collections', collectionHandler.createCollection);
    app.get('/api/collections/:collectionId', collectionHandler.getCollection);
    app.get('/api/provenance/:batchId', provenanceHandler.getProvenance);
    app.get('/api/qrcode/:batchId', qrHandler.generateQRCode);

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
