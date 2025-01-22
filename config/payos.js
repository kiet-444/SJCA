const { PayOS } = require('@payos/node');
require('dotenv').config();

const payos = new PayOS({
    apiKey: process.env.PAYOS_API_KEY,
    apiSecret: process.env.PAYOS_API_SECRET,
    environment: process.env.PAYOS_ENVIRONMENT || 'sandbox',
});

module.exports = payos;
