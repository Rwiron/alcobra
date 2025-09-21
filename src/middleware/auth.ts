import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/index';
import { UnauthorizedError } from '@/middleware/errorHandler';

interface JwtPayload {
    adminId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Extend Request type to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
                email: string;
                name: string;
            };
        }
    }
}

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Access token required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            throw new UnauthorizedError('Access token required');
        }

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as JwtPayload;

        // Find admin in database
        const admin = await prisma.admin.findUnique({
            where: {
                id: decoded.adminId,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        if (!admin) {
            throw new UnauthorizedError('Invalid token - admin not found');
        }

        // Attach admin to request object
        req.admin = admin;
        next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

// Optional auth middleware (doesn't throw error if no token)
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as JwtPayload;

        const admin = await prisma.admin.findUnique({
            where: {
                id: decoded.adminId,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        if (admin) {
            req.admin = admin;
        }

        next();
    } catch (error) {
        // Silently continue without auth
        next();
    }
};
