"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPrisma = void 0;
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
exports.mockPrisma = mockPrisma;
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));
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
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
beforeAll(async () => {
});
afterAll(async () => {
});
beforeEach(() => {
    jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map