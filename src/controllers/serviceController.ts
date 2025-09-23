import { Request, Response } from 'express';
import { Service } from '@/models/Service';
import { ServiceCategory } from '@/models/ServiceCategory';
import { asyncHandler } from '@/middleware/errorHandler';

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         slug:
 *           type: string
 *         parentId:
 *           type: string
 *           nullable: true
 *         color:
 *           type: string
 *         iconClass:
 *           type: string
 *         sortOrder:
 *           type: integer
 *         isActive:
 *           type: boolean
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         slug:
 *           type: string
 *         duration:
 *           type: integer
 *         price:
 *           type: number
 *         minPrice:
 *           type: number
 *         maxPrice:
 *           type: number
 *         priceType:
 *           type: string
 *           enum: [fixed, variable, consultation]
 *         serviceType:
 *           type: string
 *           enum: [individual, package, addon]
 *         difficultyLevel:
 *           type: string
 *           enum: [basic, intermediate, advanced, expert]
 *         categoryId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         isBookable:
 *           type: boolean
 *         requiresConsultation:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all service categories (for booking flow)
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: includeServiceCount
 *         schema:
 *           type: boolean
 *         description: Include count of bookable services in each category
 *     responses:
 *       200:
 *         description: List of service categories with optional service counts
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/ServiceCategory'
 *                       - type: object
 *                         properties:
 *                           serviceCount:
 *                             type: integer
 *                             description: Number of bookable services in this category
 *                             example: 5
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { includeServiceCount, includeServices } = req.query;

  const categories = await ServiceCategory.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: ServiceCategory,
        as: 'children',
        where: { isActive: true },
        required: false,
        order: [['sortOrder', 'ASC']],
      },
      // Include services if requested (for booking modal)
      ...(includeServices === 'true' || includeServiceCount === 'true' ? [{
        model: Service,
        as: 'services',
        where: {
          isActive: true,
          isBookable: true
        },
        required: false,
        attributes: includeServices === 'true' ? ['id', 'name', 'price', 'duration'] : ['id']
      }] : [])
    ]
  });

  // Process categories for frontend
  const processedCategories = categories.map(category => {
    const categoryData = category.toJSON() as any;

    if (includeServices === 'true') {
      // Format for booking modal - return service names array
      categoryData.services = categoryData.services ? categoryData.services.map((service: any) => service.name) : [];
    } else if (includeServiceCount === 'true') {
      // Just return count
      categoryData.serviceCount = categoryData.services ? categoryData.services.length : 0;
      delete categoryData.services;
    }

    return categoryData;
  });

  return res.json({
    success: true,
    data: processedCategories,
  });
});

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [individual, package, addon]
 *         description: Filter by service type
 *       - in: query
 *         name: isBookable
 *         schema:
 *           type: boolean
 *         description: Filter by bookable services
 *     responses:
 *       200:
 *         description: List of services
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
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, serviceType, isBookable } = req.query;

  // For public booking flow, default to only bookable services
  const whereClause: any = {
    isActive: true,
    isBookable: isBookable !== undefined ? (isBookable === 'true') : true
  };

  if (categoryId) whereClause.categoryId = categoryId;
  if (serviceType) whereClause.serviceType = serviceType;

  const services = await Service.findAll({
    where: whereClause,
    include: [
      {
        model: ServiceCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color', 'iconClass']
      }
    ],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    attributes: [
      'id', 'name', 'description', 'slug', 'duration', 'price',
      'minPrice', 'maxPrice', 'priceType', 'serviceType',
      'difficultyLevel', 'tags', 'requiresConsultation', 'imageUrl'
    ]
  });

  return res.json({
    success: true,
    data: services,
  });
});

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = await Service.findOne({
    where: { id, isActive: true },
    include: [
      {
        model: ServiceCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color', 'iconClass']
      }
    ],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  return res.json({
    success: true,
    data: service,
  });
});
