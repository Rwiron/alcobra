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
 *     summary: Get all service categories
 *     tags: [Services]
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
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
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
      }
    ]
  });

  res.json({
    success: true,
    data: categories,
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
  
  const whereClause: any = { isActive: true };
  
  if (categoryId) whereClause.categoryId = categoryId;
  if (serviceType) whereClause.serviceType = serviceType;
  if (isBookable !== undefined) whereClause.isBookable = isBookable === 'true';

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
  });

  res.json({
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

  res.json({
    success: true,
    data: service,
  });
});
