'use strict';

const QRCode = require('qrcode');
const { getContract } = require('../FabricClient');

// Generate QR code for batch provenance
exports.generateQRCode = async (req, res) => {
    try {
        const contract = getContract();
        const { batchId } = req.params;

        const provenance = await contract.evaluateTransaction(
            'GetProvenance',
            batchId
        );

        const data = provenance.toString();
        const qrCodeDataURL = await QRCode.toDataURL(data);

        res.status(200).json({ batchId, qrCode: qrCodeDataURL });
    } catch (error) {
        console.error('generateQRCode error:', error);
        res.status(500).json({ error: error.message });
    }
};
