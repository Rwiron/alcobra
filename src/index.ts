import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase, syncDatabase } from '@/config/database';

import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { setupSwagger } from '@/config/swagger';
// import { connectRedis } from '@/config/redis'; // Disabled for now

// Routes
import publicRoutes from '@/routes/public';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to Redis (disabled for now)
        // await connectRedis();
        console.log('⚠️  Redis disabled - rate limiting will use memory store');

        // Connect to database
        await connectDatabase();
        console.log('✅ Database connected successfully');

        // Security middleware
        app.use(helmet());
        app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
            credentials: true,
        }));

        // General middleware
        app.use(compression());
        app.use(morgan('combined'));
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Rate limiting
        app.use(rateLimiter);

        // Setup Swagger documentation
        setupSwagger(app);

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Routes
        app.use('/api', publicRoutes);
        app.use('/api/admin', adminRoutes);

        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });

        // Global error handler
        app.use(errorHandler);

        // Start server
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

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});
