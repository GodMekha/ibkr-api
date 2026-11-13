const axios = require("axios");
const https = require("https");

const IB_GATEWAY = "https://localhost:5000/v1/api";

const agent = new https.Agent({ rejectUnauthorized: false });

const ibkr = axios.create({
  baseURL: IB_GATEWAY,
  httpsAgent: agent,
  withCredentials: true,
});

module.exports = ibkr;
