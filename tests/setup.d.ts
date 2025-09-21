declare const mockPrisma: {
    admin: {
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
    };
    service: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
    };
    booking: {
        findMany: jest.Mock<any, any, any>;
        findUnique: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
    };
    $connect: jest.Mock<any, any, any>;
    $disconnect: jest.Mock<any, any, any>;
};
export { mockPrisma };
//# sourceMappingURL=setup.d.ts.map