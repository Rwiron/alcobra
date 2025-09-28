const serverless = require('serverless-http');

let cachedApp;

module.exports = async function handler(req, res) {
    try {
        if (!cachedApp) {
            console.log('Creating new app instance...');
            const { createApp } = require('../dist/app');
            cachedApp = await createApp();
            console.log('App created successfully');
        }

        const handle = serverless(cachedApp);
        return handle(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};


