import request from 'supertest';
import express from 'express';

// Simple health check test
describe('Health Check', () => {
    const app = express();

    app.get('/health', (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: 'test'
        });
    });

    it('should return health status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment', 'test');
    });
});
