'use strict';

const { getContract } = require('../FabricClient');

// Create a new collection
exports.createCollection = async (req, res) => {
    try {
        const contract = getContract();
        const { collectionId, name, description } = req.body;

        const result = await contract.submitTransaction(
            'CreateCollection',
            collectionId,
            name,
            description
        );

        res.status(201).json({ message: 'Collection created', txId: result.toString() });
    } catch (error) {
        console.error('createCollection error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get collection by ID
exports.getCollection = async (req, res) => {
    try {
        const contract = getContract();
        const { collectionId } = req.params;

        const collection = await contract.evaluateTransaction(
            'GetCollection',
            collectionId
        );

        res.status(200).json(JSON.parse(collection.toString()));
    } catch (error) {
        console.error('getCollection error:', error);
        res.status(404).json({ error: error.message });
    }
};
