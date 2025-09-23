import { Request, Response } from 'express';
import { Service } from '@/models/Service';
import { ServiceCategory } from '@/models/ServiceCategory';
import { asyncHandler, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { Op } from 'sequelize';

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Face Treatments"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Professional facial treatments and skincare services"
 *         slug:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *           example: "face-treatments"
 *         parentId:
 *           type: string
 *           nullable: true
 *           example: null
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-Fa-f]{6}$'
 *           example: "#FF6B6B"
 *         iconClass:
 *           type: string
 *           example: "fas fa-spa"
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           example: 1
 *     ServiceRequest:
 *       type: object
 *       required:
 *         - name
 *         - duration
 *         - price
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Deep Cleansing Facial"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "A thorough facial treatment that deep cleanses pores and rejuvenates skin"
 *         slug:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *           example: "deep-cleansing-facial"
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 480
 *           example: 60
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 85.00
 *         minPrice:
 *           type: number
 *           minimum: 0
 *           example: 75.00
 *         maxPrice:
 *           type: number
 *           minimum: 0
 *           example: 95.00
 *         priceType:
 *           type: string
 *           enum: [fixed, variable, consultation]
 *           example: "fixed"
 *         serviceType:
 *           type: string
 *           enum: [individual, package, addon]
 *           example: "individual"
 *         difficultyLevel:
 *           type: string
 *           enum: [basic, intermediate, advanced, expert]
 *           example: "intermediate"
 *         categoryId:
 *           type: string
 *           example: "cat-123"
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           example: ["skin-consultation"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["facial", "deep-cleansing", "anti-aging"]
 *         preparationTime:
 *           type: integer
 *           minimum: 0
 *           example: 10
 *         cleanupTime:
 *           type: integer
 *           minimum: 0
 *           example: 15
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           example: 1
 *         isActive:
 *           type: boolean
 *           example: true
 *         isBookable:
 *           type: boolean
 *           example: true
 *         requiresConsultation:
 *           type: boolean
 *           example: false
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/images/deep-cleansing-facial.jpg"
 */

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Validation helpers
const validateCategoryData = (data: any) => {
    const { name } = data;

    if (!name || name.trim().length < 2) {
        throw new ValidationError('Category name is required and must be at least 2 characters');
    }

    if (name.trim().length > 100) {
        throw new ValidationError('Category name must not exceed 100 characters');
    }

    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
        throw new ValidationError('Color must be a valid hex color code (e.g., #FF6B6B)');
    }

    return {
        name: name.trim(),
        description: data.description?.trim() || undefined,
        slug: data.slug?.trim() || generateSlug(name),
        parentId: data.parentId || undefined,
        color: data.color || '#6366F1',
        iconClass: data.iconClass?.trim() || 'fas fa-spa',
        sortOrder: parseInt(data.sortOrder) || 0
    };
};

interface ServiceRequestData {
    name: string;
    description?: string;
    slug?: string;
    duration: number;
    price: number;
    minPrice?: number;
    maxPrice?: number;
    priceType?: string;
    serviceType?: string;
    difficultyLevel?: string;
    categoryId: string;
    prerequisites?: string[];
    tags?: string[];
    preparationTime?: number;
    cleanupTime?: number;
    sortOrder?: number;
    isActive?: boolean;
    isBookable?: boolean;
    requiresConsultation?: boolean;
    imageUrl?: string;
    images?: string[];
    videoUrl?: string;
}

const validateServiceData = (data: ServiceRequestData) => {
    const { name, duration, price, categoryId } = data;

    if (!name || name.trim().length < 2) {
        throw new ValidationError('Service name is required and must be at least 2 characters');
    }

    if (!duration || duration < 15 || duration > 480) {
        throw new ValidationError('Duration must be between 15 and 480 minutes');
    }

    if (price === undefined || price < 0) {
        throw new ValidationError('Price must be a positive number');
    }

    if (!categoryId) {
        throw new ValidationError('Category ID is required');
    }

    if (data.minPrice !== undefined && data.minPrice < 0) {
        throw new ValidationError('Minimum price must be a positive number');
    }

    if (data.maxPrice !== undefined && data.maxPrice < 0) {
        throw new ValidationError('Maximum price must be a positive number');
    }

    if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
        throw new ValidationError('Minimum price cannot be greater than maximum price');
    }

    return {
        name: name.trim(),
        description: data.description?.trim() || undefined,
        slug: data.slug?.trim() || generateSlug(name),
        duration: parseInt(duration.toString()),
        price: parseFloat(price.toString()),
        minPrice: data.minPrice ? parseFloat(data.minPrice.toString()) : undefined,
        maxPrice: data.maxPrice ? parseFloat(data.maxPrice.toString()) : undefined,
        priceType: data.priceType || 'fixed',
        serviceType: data.serviceType || 'individual',
        difficultyLevel: data.difficultyLevel || 'basic',
        categoryId,
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        preparationTime: parseInt(data.preparationTime) || 0,
        cleanupTime: parseInt(data.cleanupTime) || 0,
        sortOrder: parseInt(data.sortOrder) || 0,
        isActive: data.isActive !== false,
        isBookable: data.isBookable !== false,
        requiresConsultation: data.requiresConsultation === true,
        imageUrl: data.imageUrl?.trim() || undefined,
        images: Array.isArray(data.images) ? data.images.filter(url => url && typeof url === 'string') : [],
        videoUrl: data.videoUrl?.trim() || undefined
    };
};

// ========== SERVICE CATEGORY MANAGEMENT ==========

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all service categories (Admin)
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive categories
 *     responses:
 *       200:
 *         description: List of service categories
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
 *                     $ref: '#/components/schemas/ServiceCategory'
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const { includeInactive } = req.query;

    const whereClause: any = {};
    if (!includeInactive) {
        whereClause.isActive = true;
    }

    const categories = await ServiceCategory.findAll({
        where: whereClause,
        order: [['sortOrder', 'ASC'], ['name', 'ASC']],
        include: [
            {
                model: ServiceCategory,
                as: 'children',
                required: false,
                order: [['sortOrder', 'ASC']]
            },
            {
                model: Service,
                as: 'services',
                required: false,
                attributes: ['id', 'name', 'isActive']
            }
        ]
    });

    return res.json({
        success: true,
        data: categories
    });
});

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create new service category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Validation error
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateCategoryData(req.body);

    // Check if slug already exists
    const existingCategory = await ServiceCategory.findOne({
        where: { slug: validatedData.slug }
    });

    if (existingCategory) {
        throw new ValidationError('A category with this slug already exists');
    }

    // If parentId is provided, validate it exists
    if (validatedData.parentId) {
        const parentCategory = await ServiceCategory.findByPk(validatedData.parentId);
        if (!parentCategory) {
            throw new ValidationError('Parent category not found');
        }
    }

    const category = await ServiceCategory.create({
        ...validatedData,
        isActive: true
    });

    return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
    });
});

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update service category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = validateCategoryData(req.body);

    const category = await ServiceCategory.findByPk(id);
    if (!category) {
        throw new NotFoundError('Category not found');
    }

    // Check if slug already exists (excluding current category)
    const existingCategory = await ServiceCategory.findOne({
        where: {
            slug: validatedData.slug,
            id: { [Op.ne]: id }
        }
    });

    if (existingCategory) {
        throw new ValidationError('A category with this slug already exists');
    }

    await category.update(validatedData);

    return res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
    });
});

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete service category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with active services
 *       404:
 *         description: Category not found
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await ServiceCategory.findByPk(id);
    if (!category) {
        throw new NotFoundError('Category not found');
    }

    // Check if category has active services
    const activeServicesCount = await Service.count({
        where: {
            categoryId: id,
            isActive: true
        }
    });

    if (activeServicesCount > 0) {
        throw new ValidationError('Cannot delete category with active services. Please deactivate or move services first.');
    }

    // Check if category has child categories
    const childCategoriesCount = await ServiceCategory.count({
        where: { parentId: id }
    });

    if (childCategoriesCount > 0) {
        throw new ValidationError('Cannot delete category with child categories. Please delete or move child categories first.');
    }

    await category.destroy();

    return res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});

// ========== SERVICE MANAGEMENT ==========

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: Get all services (Admin)
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive services
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of services with pagination
 */
export const getAllServices = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId, includeInactive, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (categoryId) {
        whereClause.categoryId = categoryId;
    }

    if (!includeInactive) {
        whereClause.isActive = true;
    }

    const { rows: services, count: total } = await Service.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: ServiceCategory,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'color', 'iconClass']
            }
        ],
        order: [['sortOrder', 'ASC'], ['name', 'ASC']],
        limit: limitNum,
        offset
    });

    const pages = Math.ceil(total / limitNum);

    return res.json({
        success: true,
        data: {
            services,
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
 * /api/admin/services:
 *   post:
 *     summary: Create new service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRequest'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 */
export const createService = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateServiceData(req.body);

    // Verify category exists
    const category = await ServiceCategory.findOne({
        where: {
            id: validatedData.categoryId,
            isActive: true
        }
    });

    if (!category) {
        throw new NotFoundError('Category not found or inactive');
    }

    // Check if slug already exists
    const existingService = await Service.findOne({
        where: { slug: validatedData.slug }
    });

    if (existingService) {
        throw new ValidationError('A service with this slug already exists');
    }

    const service = await Service.create(validatedData);

    // Fetch created service with category
    const createdService = await Service.findByPk(service.id, {
        include: [
            {
                model: ServiceCategory,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'color', 'iconClass']
            }
        ]
    });

    return res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: createdService
    });
});

/**
 * @swagger
 * /api/admin/services/{id}:
 *   get:
 *     summary: Get service by ID (Admin)
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
        include: [
            {
                model: ServiceCategory,
                as: 'category'
            }
        ]
    });

    if (!service) {
        throw new NotFoundError('Service not found');
    }

    return res.json({
        success: true,
        data: service
    });
});

/**
 * @swagger
 * /api/admin/services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRequest'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
export const updateService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = validateServiceData(req.body);

    const service = await Service.findByPk(id);
    if (!service) {
        throw new NotFoundError('Service not found');
    }

    // Verify category exists
    const category = await ServiceCategory.findOne({
        where: {
            id: validatedData.categoryId,
            isActive: true
        }
    });

    if (!category) {
        throw new NotFoundError('Category not found or inactive');
    }

    // Check if slug already exists (excluding current service)
    const existingService = await Service.findOne({
        where: {
            slug: validatedData.slug,
            id: { [Op.ne]: id }
        }
    });

    if (existingService) {
        throw new ValidationError('A service with this slug already exists');
    }

    await service.update(validatedData);

    // Fetch updated service with category
    const updatedService = await Service.findByPk(id, {
        include: [
            {
                model: ServiceCategory,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'color', 'iconClass']
            }
        ]
    });

    return res.json({
        success: true,
        message: 'Service updated successfully',
        data: updatedService
    });
});

/**
 * @swagger
 * /api/admin/services/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       400:
 *         description: Cannot delete service with active bookings
 *       404:
 *         description: Service not found
 */
export const deleteService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
        throw new NotFoundError('Service not found');
    }

    // Check if service has pending or confirmed bookings
    const { Booking } = await import('@/models/Booking');
    const activeBookingsCount = await Booking.count({
        where: {
            serviceId: id,
            status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
        }
    });

    if (activeBookingsCount > 0) {
        throw new ValidationError('Cannot delete service with pending or confirmed bookings. Please complete or cancel bookings first.');
    }

    await service.destroy();

    return res.json({
        success: true,
        message: 'Service deleted successfully'
    });
});
