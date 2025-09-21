import { PrismaClient } from '@prisma/client';

// Mock Prisma for tests
const mockPrisma = {
    admin: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    service: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    booking: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock Redis
jest.mock('@/config/redis', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        connect: jest.fn(),
        quit: jest.fn(),
    },
    connectRedis: jest.fn(),
    disconnectRedis: jest.fn(),
}));

// Mock AWS S3
jest.mock('aws-sdk', () => ({
    S3: jest.fn(() => ({
        upload: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
            }),
        }),
        deleteObject: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({}),
        }),
    })),
}));

// Mock Twilio
jest.mock('twilio', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        messages: {
            create: jest.fn().mockResolvedValue({
                sid: 'test-message-sid',
                status: 'sent',
            }),
        },
    })),
}));

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

// Global test setup
beforeAll(async () => {
    // Any global setup
});

afterAll(async () => {
    // Any global cleanup
});

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

export { mockPrisma };
