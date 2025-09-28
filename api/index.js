const serverless = require('serverless-http');

module.exports = async function handler(req, res) {
    const { createApp } = require('../dist/app');
    const app = await createApp();
    const handle = serverless(app);
    return handle(req, res);
};


