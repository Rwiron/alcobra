import { Router } from 'express';
import { bookingRateLimit } from '@/middleware/rateLimiter';

// Controllers
import { getServices, getServiceById, getCategories } from '@/controllers/serviceController';
import { createBooking, getBookingById } from '@/controllers/bookingController';
import { getTransformations, getTransformationById } from '@/controllers/transformationController';

const router = Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of active services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 */
// Get service categories
router.get('/categories', getCategories);

// Get service categories (alias for frontend compatibility)
router.get('/services/categories', getCategories);

// Get services
router.get('/services', getServices);

// Get service by ID
router.get('/services/:id', getServiceById);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking request
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - serviceId
 *               - requestedDate
 *               - requestedTime
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               customerPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               customerEmail:
 *                 type: string
 *                 example: "john@example.com"
 *               serviceId:
 *                 type: string
 *                 example: "clfxyz123"
 *               requestedDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-25"
 *               requestedTime:
 *                 type: string
 *                 format: time
 *                 example: "14:30"
 *               notes:
 *                 type: string
 *                 example: "Special requests or notes"
 *     responses:
 *       201:
 *         description: Booking request created successfully
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
 *                   example: "Booking request submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/bookings', bookingRateLimit, createBooking);

// Get booking by ID (with phone verification)
router.get('/bookings/:id', getBookingById);

// Gallery endpoints for frontend gallery display (public, no auth required)
router.get('/gallery', getServices); // Use services endpoint for gallery (now includes images)
router.get('/gallery/categories', getCategories); // Use categories endpoint for gallery filtering
router.get('/gallery/:id', getServiceById); // Use service detail for gallery detail

// Transformation endpoints (Before & After) - Public access
router.get('/transformations', getTransformations);
router.get('/transformations/:id', getTransformationById);

export default router;
