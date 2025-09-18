# Traceher Backend (Demo-ready)

This backend is a ready-to-run Node.js + Express scaffold that connects to your existing Hyperledger Fabric chaincode.

## Features
- Endpoints: auth (OTP demo), harvests, batches, provenance, lab test upload (multipart), recall, file signed URL stub
- Fabric helpers: gateway.js and invoke.js using fabric-network
- Multer for file uploads, AWS S3 integration stub (configure env vars if desired)

## Setup
1. Install dependencies: `npm install`
2. Place your Fabric `connection-profile.json` and wallet under `config/` and `wallet/` respectively, or update `config/fabricConfig.json`.
3. Run: `node server.js` (or `npm run dev` if you have nodemon)

## Environment variables (optional)
- AWS_REGION, S3_BUCKET for S3 uploads

## Notes
- For demo, many stores are in-memory. Replace with Postgres or MongoDB for production.
- Ensure wallet identities match `config/fabricConfig.json` identity.
