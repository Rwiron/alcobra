import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase } from '@/config/database';

import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { setupSwagger } from '@/config/swagger';
// import { connectRedis } from '@/config/redis'; // Disabled for now

// Routes
import publicRoutes from '@/routes/public';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

export async function createApp() {
    const app = express();

    // Connect to Redis (disabled for now)
    // await connectRedis();
    console.log('⚠️  Redis disabled - rate limiting will use memory store');

    // Connect to database (optional in serverless)
    try {
        await connectDatabase();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.warn('⚠️ Database connection failed:', error instanceof Error ? error.message : String(error));
        console.warn('⚠️ Continuing without database connection');
    }

    // Security middleware
    app.use(helmet({
        crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3001'];
    app.use(cors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204
    }));

    // General middleware
    app.use(compression());
    app.use(morgan('combined'));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve uploaded images statically
    app.use('/uploads', express.static('uploads'));

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

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'Alcobra Salon API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                docs: '/api-docs',
                api: '/api',
                admin: '/api/admin'
            }
        });
    });

    // Handle preflight requests explicitly
    app.options('*', cors());

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

    return app;
}

export default createApp;


