"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
describe('Health Check', () => {
    const app = (0, express_1.default)();
    app.get('/health', (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: 'test'
        });
    });
    it('should return health status', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/health')
            .expect(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment', 'test');
    });
});
//# sourceMappingURL=health.test.js.map