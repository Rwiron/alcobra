import { Router } from 'express';
import { authenticateAdmin } from '@/middleware/auth';
import { authRateLimit, uploadRateLimit, resetAllLimiters } from '@/middleware/rateLimiter';

// Controllers
import { login, refreshToken, logout, getProfile } from '@/controllers/authController';
import { getAllBookings, updateBookingStatus, getBookingByIdAdmin } from '@/controllers/bookingController';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllServices,
    createService,
    getServiceById,
    updateService,
    deleteService
} from '@/controllers/adminServiceController';
import {
    upload,
    uploadImages,
    deleteImageById,
    extractPublicIdFromUrl,
    generateResponsiveUrls
} from '@/controllers/uploadController';
import {
    uploadLocal,
    uploadImagesLocal,
    deleteLocalImages
} from '@/controllers/localUploadController';
import { uploadServiceMedia, deleteServiceMedia, uploadMiddleware } from '@/controllers/mediaUploadController';
import {
    getAllTransformations,
    createTransformation,
    updateTransformation,
    deleteTransformation
} from '@/controllers/transformationController';

const router = Router();

// Development only - Reset rate limits (no auth required)
if (process.env.NODE_ENV === 'development') {
    router.post('/dev/reset-rate-limits', async (req, res) => {
        try {
            const ip = req.ip || 'unknown';
            await resetAllLimiters(ip);
            res.json({
                success: true,
                message: 'Rate limits reset successfully',
                ip
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to reset rate limits',
                error: error.message
            });
        }
    });
}

// Auth routes (no authentication required)
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
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@alcobrasalon.com"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 */
router.post('/auth/login', authRateLimit, login);

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
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/auth/refresh', refreshToken);

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
 */
router.post('/auth/logout', authenticateAdmin, logout);

// Get current admin profile
router.get('/auth/me', authenticateAdmin, getProfile);

// Protected admin routes
router.use(authenticateAdmin);

// Booking management
// Get all bookings with filtering and pagination
router.get('/bookings', getAllBookings);

// Get specific booking by ID
router.get('/bookings/:id', getBookingByIdAdmin);

// Update booking status
router.put('/bookings/:id/status', updateBookingStatus);

// Category management
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Service management
router.get('/services', getAllServices);
router.post('/services', createService);
router.get('/services/:id', getServiceById);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Cloudinary upload endpoints
router.post('/upload/cloudinary', uploadRateLimit, upload.array('images', 5), uploadImages);
router.delete('/upload/cloudinary/:publicId', deleteImageById);
router.post('/upload/url-to-publicid', extractPublicIdFromUrl);
router.post('/upload/generate-urls', generateResponsiveUrls);

// Local upload endpoints
router.post('/upload/local', uploadRateLimit, uploadLocal.array('images', 5), uploadImagesLocal);
router.delete('/upload/local/:filename', deleteLocalImages);

// Default upload (can be configured to use either Cloudinary or local)
router.post('/upload', uploadRateLimit, uploadLocal.array('images', 5), uploadImagesLocal);

// Service media upload endpoints (images + video)
router.post('/upload/media', uploadRateLimit, uploadMiddleware, uploadServiceMedia);
router.delete('/upload/media/:filename', deleteServiceMedia);

// Transformation management (Before & After)
router.get('/transformations', getAllTransformations);
router.post('/transformations', createTransformation);
router.put('/transformations/:id', updateTransformation);
router.delete('/transformations/:id', deleteTransformation);

// Dashboard stats
router.get('/dashboard/stats', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard stats endpoint - to be implemented',
        data: {}
    });
});

export default router;
