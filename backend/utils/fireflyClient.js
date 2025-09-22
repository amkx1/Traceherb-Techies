const axios = require("axios");

const fireflyClient = axios.create({
  baseURL: process.env.FIREFLY_API,
  headers: { "Content-Type": "application/json" }
});

module.exports = fireflyClient;
