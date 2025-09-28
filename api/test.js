module.exports = function handler(req, res) {
    res.json({
        message: 'Test endpoint working',
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};
