import { createClient } from 'redis';

export let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD || '',
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('🔗 Redis Client Connected');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis Client Ready');
        });

        await redisClient.connect();

        return redisClient;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        throw error;
    }
}

export async function disconnectRedis() {
    if (redisClient) {
        await redisClient.quit();
        console.log('👋 Redis Client Disconnected');
    }
}
