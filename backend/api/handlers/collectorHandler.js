'use strict';

const { getContract } = require('../FabricClient');

// Example: register a collector
exports.registerCollector = async (req, res) => {
    try {
        const contract = getContract();
        const { collectorId, name, location } = req.body;

        const result = await contract.submitTransaction(
            'RegisterCollector',
            collectorId,
            name,
            location
        );

        res.status(201).json({ message: 'Collector registered', txId: result.toString() });
    } catch (error) {
        console.error('registerCollector error:', error);
        res.status(500).json({ error: error.message });
    }
};
