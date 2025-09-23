import { Request, Response } from 'express';
import { Booking, BookingStatus } from '@/models/Booking';
import { Service } from '@/models/Service';
import { ServiceCategory } from '@/models/ServiceCategory';
import { asyncHandler, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { Op } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingRequest:
 *       type: object
 *       required:
 *         - customerName
 *         - customerPhone
 *         - serviceId
 *         - requestedDate
 *         - requestedTime
 *       properties:
 *         customerName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         customerPhone:
 *           type: string
 *           pattern: '^[+]?[1-9]\d{1,14}$'
 *           example: "+1234567890"
 *         customerEmail:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         serviceId:
 *           type: string
 *           example: "clfxyz123"
 *         requestedDate:
 *           type: string
 *           format: date
 *           example: "2023-12-25"
 *         requestedTime:
 *           type: string
 *           format: time
 *           example: "14:30"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Special requests or notes"
 *     BookingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         customerEmail:
 *           type: string
 *         serviceId:
 *           type: string
 *         requestedDate:
 *           type: string
 *           format: date
 *         requestedTime:
 *           type: string
 *           format: time
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
 *         notes:
 *           type: string
 *         adminNotes:
 *           type: string
 *         service:
 *           $ref: '#/components/schemas/Service'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Validation helpers
const validateBookingData = (data: any) => {
    const { customerName, customerPhone, serviceId, serviceType, requestedDate, requestedTime, preferredDateTime } = data;

    if (!customerName || customerName.trim().length < 2) {
        throw new ValidationError('Customer name is required and must be at least 2 characters');
    }

    if (!customerPhone || !/^[+]?[1-9]\d{1,14}$/.test(customerPhone)) {
        throw new ValidationError('Valid customer phone number is required');
    }

    // Accept either serviceId (existing) or serviceType (frontend format)
    if (!serviceId && !serviceType) {
        throw new ValidationError('Service ID or service type is required');
    }

    // Handle both separate date/time and combined preferredDateTime formats
    if (!requestedDate && !preferredDateTime) {
        throw new ValidationError('Requested date is required');
    }

    if (!requestedTime && !preferredDateTime) {
        throw new ValidationError('Requested time is required');
    }

    // Validate date format and ensure it's not in the past
    let bookingDate;
    if (preferredDateTime) {
        bookingDate = new Date(preferredDateTime.replace(' ', 'T'));
    } else {
        bookingDate = new Date(`${requestedDate}T${requestedTime}`);
    }
    const now = new Date();

    if (isNaN(bookingDate.getTime())) {
        throw new ValidationError('Invalid date or time format');
    }

    if (bookingDate <= now) {
        throw new ValidationError('Booking date and time must be in the future');
    }

    // Validate email if provided
    if (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        throw new ValidationError('Invalid email format');
    }

    return {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: data.customerEmail?.trim() || null,
        serviceId,
        requestedDate: new Date(requestedDate),
        requestedTime: new Date(`1970-01-01T${requestedTime}`),
        notes: data.notes?.trim() || null
    };
};

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking request
 *     tags: [Public Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRequest'
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
 *                   $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service not found
 */
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateBookingData(req.body);

    // Process frontend data format
    let processedData = { ...validatedData };

    // Handle preferredDateTime format (frontend sends combined date/time)
    if (req.body.preferredDateTime && !req.body.requestedDate && !req.body.requestedTime) {
        const [datePart, timePart] = req.body.preferredDateTime.split(' ');
        processedData.requestedDate = datePart;
        processedData.requestedTime = timePart;
    }

    // Handle specialRequests -> notes mapping
    if (req.body.specialRequests) {
        processedData.notes = req.body.specialRequests;
    }

    // Handle service lookup by name if serviceType provided instead of serviceId
    let serviceId = processedData.serviceId;
    if (!serviceId && req.body.serviceType) {
        const serviceByName = await Service.findOne({
            where: {
                name: req.body.serviceType,
                isActive: true,
                isBookable: true
            }
        });

        if (!serviceByName) {
            throw new NotFoundError(`Service "${req.body.serviceType}" not found or not available for booking`);
        }

        serviceId = serviceByName.id;
        processedData.serviceId = serviceId;
    }

    // Check if service exists and is bookable
    const service = await Service.findOne({
        where: {
            id: serviceId,
            isActive: true,
            isBookable: true
        },
        include: [
            {
                model: ServiceCategory,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            }
        ]
    });

    if (!service) {
        throw new NotFoundError('Service not found or not available for booking');
    }

    // Check for conflicting bookings (basic time slot validation)
    const conflictingBooking = await Booking.findOne({
        where: {
            serviceId: processedData.serviceId,
            requestedDate: processedData.requestedDate,
            requestedTime: processedData.requestedTime,
            status: {
                [Op.in]: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
            }
        }
    });

    if (conflictingBooking) {
        throw new ValidationError('This time slot is already booked. Please choose a different time.');
    }

    // Create the booking with processed data
    const booking = await Booking.create({
        ...processedData,
        status: BookingStatus.PENDING
    });

    // Fetch the created booking with service details
    const createdBooking = await Booking.findByPk(booking.id, {
        include: [
            {
                model: Service,
                as: 'service',
                include: [
                    {
                        model: ServiceCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }
        ]
    });

    return res.status(201).json({
        success: true,
        message: 'Booking request submitted successfully. We will contact you soon to confirm.',
        data: createdBooking
    });
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID (public access with phone verification)
 *     tags: [Public Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number for verification
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Phone number required
 *       401:
 *         description: Phone number doesn't match
 *       404:
 *         description: Booking not found
 */
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { phone } = req.query;

    if (!phone) {
        throw new ValidationError('Phone number is required to view booking details');
    }

    const booking = await Booking.findByPk(id, {
        include: [
            {
                model: Service,
                as: 'service',
                include: [
                    {
                        model: ServiceCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }
        ]
    });

    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    // Verify phone number matches (simple security measure)
    if (booking.customerPhone !== phone) {
        throw new ValidationError('Phone number does not match our records');
    }

    return res.json({
        success: true,
        data: booking
    });
});

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by booking status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, phone, or email
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings to this date
 *     responses:
 *       200:
 *         description: List of bookings with pagination
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
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BookingResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
    const {
        status,
        page = 1,
        limit = 10,
        search,
        dateFrom,
        dateTo
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {};

    if (status && Object.values(BookingStatus).includes(status as BookingStatus)) {
        whereClause.status = status;
    }

    if (search) {
        whereClause[Op.or] = [
            { customerName: { [Op.like]: `%${search}%` } },
            { customerPhone: { [Op.like]: `%${search}%` } },
            { customerEmail: { [Op.like]: `%${search}%` } }
        ];
    }

    if (dateFrom) {
        whereClause.requestedDate = {
            ...whereClause.requestedDate,
            [Op.gte]: new Date(dateFrom as string)
        };
    }

    if (dateTo) {
        whereClause.requestedDate = {
            ...whereClause.requestedDate,
            [Op.lte]: new Date(dateTo as string)
        };
    }

    // Get bookings with pagination
    const { rows: bookings, count: total } = await Booking.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Service,
                as: 'service',
                include: [
                    {
                        model: ServiceCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
    });

    const pages = Math.ceil(total / limitNum);

    return res.json({
        success: true,
        data: {
            bookings,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages
            }
        }
    });
});

/**
 * @swagger
 * /api/admin/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (Admin only)
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
 *               adminNotes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking status updated successfully
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
 *                   example: "Booking status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Booking not found
 */
export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !Object.values(BookingStatus).includes(status)) {
        throw new ValidationError('Valid booking status is required');
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    // Update booking with status and timestamps
    const updateData: any = {
        status,
        adminNotes: adminNotes?.trim() || booking.adminNotes
    };

    // Set appropriate timestamps based on status
    const now = new Date();
    switch (status) {
        case BookingStatus.CONFIRMED:
            updateData.confirmedAt = now;
            break;
        case BookingStatus.COMPLETED:
            updateData.completedAt = now;
            break;
        case BookingStatus.CANCELLED:
        case BookingStatus.NO_SHOW:
            updateData.cancelledAt = now;
            break;
    }

    await booking.update(updateData);

    // Fetch updated booking with service details
    const updatedBooking = await Booking.findByPk(id, {
        include: [
            {
                model: Service,
                as: 'service',
                include: [
                    {
                        model: ServiceCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }
        ]
    });

    return res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: updatedBooking
    });
});

/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking details (Admin only)
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BookingResponse'
 *       404:
 *         description: Booking not found
 */
export const getBookingByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
        include: [
            {
                model: Service,
                as: 'service',
                include: [
                    {
                        model: ServiceCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'slug']
                    }
                ]
            }
        ]
    });

    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    return res.json({
        success: true,
        data: booking
    });
});
