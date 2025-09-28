import { createApp } from './app';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        const app = await createApp();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});
