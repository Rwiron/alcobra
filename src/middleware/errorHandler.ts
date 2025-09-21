import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    error: CustomError | ZodError | Prisma.PrismaClientKnownRequestError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any[] = [];

    // Zod validation errors
    if (error instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }
    // Prisma errors
    else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;

        switch (error.code) {
            case 'P2002':
                message = 'Duplicate entry. This record already exists.';
                break;
            case 'P2025':
                message = 'Record not found.';
                statusCode = 404;
                break;
            case 'P2003':
                message = 'Foreign key constraint violation.';
                break;
            case 'P2014':
                message = 'Invalid ID provided.';
                break;
            default:
                message = 'Database operation failed.';
        }
    }
    // Custom application errors
    else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message;
    }
    // JWT errors
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Multer errors (file upload)
    else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size too large';
    }
    else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file field';
    }
    // Default error
    else {
        message = error.message || 'Internal Server Error';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', error);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Custom error classes
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed') {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden access') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
