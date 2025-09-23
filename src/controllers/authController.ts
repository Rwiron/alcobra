import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '@/models/Admin';
import { asyncHandler, ValidationError, UnauthorizedError } from '@/middleware/errorHandler';

// JWT Token generation
const generateTokens = (adminId: string, email: string) => {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error('JWT secrets not configured');
    }

    const payload = { adminId, email };

    const accessToken = jwt.sign(payload, accessSecret, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@alcobrasalon.com
 *         password:
 *           type: string
 *           example: admin123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             admin:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: admin-001
 *                 email:
 *                   type: string
 *                   example: admin@alcobrasalon.com
 *                 name:
 *                   type: string
 *                   example: Alcobra Salon Admin
 */

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    // Find admin by email
    const admin = await Admin.findOne({
        where: {
            email: email.toLowerCase(),
            isActive: true
        }
    });

    if (!admin) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin.id, admin.email);

    // Return response (excluding password)
    return res.json({
        success: true,
        message: 'Login successful',
        data: {
            accessToken,
            refreshToken,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            }
        }
    });
});

/**
 * @swagger
 * /api/admin/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new UnauthorizedError('Refresh token is required');
    }

    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new Error('JWT refresh secret not configured');
        }

        // Verify refresh token
        const decoded = jwt.verify(token, refreshSecret) as any;

        // Find admin to make sure they still exist and are active
        const admin = await Admin.findOne({
            where: {
                id: decoded.adminId,
                isActive: true
            }
        });

        if (!admin) {
            throw new UnauthorizedError('Invalid refresh token - admin not found');
        }

        // Generate new tokens
        const tokens = generateTokens(admin.id, admin.email);

        return res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid refresh token');
        }
        throw error;
    }
});

/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just return success (client should delete the token)

    return res.json({
        success: true,
        message: 'Logout successful'
    });
});

/**
 * @swagger
 * /api/admin/auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    // req.admin is set by the authenticateAdmin middleware
    return res.json({
        success: true,
        data: req.admin
    });
});
