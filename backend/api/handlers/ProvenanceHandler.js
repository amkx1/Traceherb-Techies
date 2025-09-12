'use strict';

const { getContract } = require('../FabricClient');

// Get provenance data
exports.getProvenance = async (req, res) => {
    try {
        const contract = getContract();
        const { batchId } = req.params;

        const provenance = await contract.evaluateTransaction(
            'GetProvenance',
            batchId
        );

        res.status(200).json(JSON.parse(provenance.toString()));
    } catch (error) {
        console.error('getProvenance error:', error);
        res.status(404).json({ error: error.message });
    }
};
