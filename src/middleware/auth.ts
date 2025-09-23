import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '@/models/Admin';
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

        const accessSecret = process.env.JWT_ACCESS_SECRET;
        if (!accessSecret) {
            throw new UnauthorizedError('JWT secret not configured');
        }

        // Verify JWT token
        const decoded = jwt.verify(token, accessSecret) as JwtPayload;

        // Find admin in database
        const admin = await Admin.findOne({
            where: {
                id: decoded.adminId,
                isActive: true
            },
            attributes: ['id', 'email', 'name']
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

        const accessSecret = process.env.JWT_ACCESS_SECRET;
        if (!accessSecret) {
            return next(); // Silently continue without auth for optional auth
        }

        const decoded = jwt.verify(token, accessSecret) as JwtPayload;

        const admin = await Admin.findOne({
            where: {
                id: decoded.adminId,
                isActive: true
            },
            attributes: ['id', 'email', 'name']
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
