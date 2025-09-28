import { Request, Response } from 'express';
import { Transformation } from '@/models';
import { ValidationError, DatabaseError, Op } from 'sequelize';

// Get all active transformations (public endpoint)
export const getTransformations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, limit = 12 } = req.query;

        const whereClause: any = { isActive: true };
        if (category) {
            whereClause.category = category;
        }

        const transformations = await Transformation.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit as string),
            attributes: ['id', 'title', 'description', 'beforeImage', 'afterImage', 'category', 'createdAt']
        });

        res.json({
            success: true,
            data: transformations
        });
        return;
    } catch (error: any) {
        console.error('Error fetching transformations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transformations'
        });
        return;
    }
};

// Get single transformation by ID (public endpoint)
export const getTransformationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const transformation = await Transformation.findOne({
            where: { id, isActive: true },
            attributes: ['id', 'title', 'description', 'beforeImage', 'afterImage', 'category', 'createdAt']
        });

        if (!transformation) {
            res.status(404).json({
                success: false,
                message: 'Transformation not found'
            });
            return;
        }

        res.json({
            success: true,
            data: transformation
        });
        return;
    } catch (error) {
        console.error('Error fetching transformation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transformation'
        });
        return;
    }
};

// Admin: Get all transformations
export const getAllTransformations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const whereClause: any = {};
        if (category) {
            whereClause.category = category;
        }
        if (search) {
            whereClause.title = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Transformation.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit as string),
            offset
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total: count,
                pages: Math.ceil(count / parseInt(limit as string))
            }
        });
        return;
    } catch (error) {
        console.error('Error fetching all transformations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transformations'
        });
        return;
    }
};

// Admin: Create transformation
export const createTransformation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, beforeImage, afterImage, category } = req.body;

        if (!title || !beforeImage || !afterImage) {
            res.status(400).json({
                success: false,
                message: 'Title, before image, and after image are required'
            });
            return;
        }

        const transformation = await Transformation.create({
            title,
            description,
            beforeImage,
            afterImage,
            category: category || null
        });

        res.status(201).json({
            success: true,
            message: 'Transformation created successfully',
            data: transformation
        });
        return;
    } catch (error) {
        console.error('Error creating transformation:', error);

        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => err.message)
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create transformation'
        });
        return;
    }
};

// Admin: Update transformation
export const updateTransformation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, beforeImage, afterImage, category, isActive } = req.body;

        const transformation = await Transformation.findByPk(id);
        if (!transformation) {
            res.status(404).json({
                success: false,
                message: 'Transformation not found'
            });
            return;
        }

        await transformation.update({
            title: title || transformation.title,
            description: description !== undefined ? description : transformation.description,
            beforeImage: beforeImage || transformation.beforeImage,
            afterImage: afterImage || transformation.afterImage,
            category: category !== undefined ? category : transformation.category,
            isActive: isActive !== undefined ? isActive : transformation.isActive
        });

        res.json({
            success: true,
            message: 'Transformation updated successfully',
            data: transformation
        });
        return;
    } catch (error) {
        console.error('Error updating transformation:', error);

        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => err.message)
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update transformation'
        });
        return;
    }
};

// Admin: Delete transformation
export const deleteTransformation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const transformation = await Transformation.findByPk(id);
        if (!transformation) {
            res.status(404).json({
                success: false,
                message: 'Transformation not found'
            });
            return;
        }

        await transformation.destroy();

        res.json({
            success: true,
            message: 'Transformation deleted successfully'
        });
        return;
    } catch (error) {
        console.error('Error deleting transformation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transformation'
        });
        return;
    }
};

export default {
    getTransformations,
    getTransformationById,
    getAllTransformations,
    createTransformation,
    updateTransformation,
    deleteTransformation
};
