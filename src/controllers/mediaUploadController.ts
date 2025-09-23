import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { asyncHandler, ValidationError } from '@/middleware/errorHandler';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'services');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === 'images') {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for images'));
        }
    } else if (file.fieldname === 'video') {
        // Accept videos only
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed for video'));
        }
    } else {
        cb(new Error('Invalid field name'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for videos
        files: 5 // Max 4 images + 1 video
    }
});

export const uploadMiddleware = upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'video', maxCount: 1 }
]);

/**
 * @swagger
 * /api/admin/upload/media:
 *   post:
 *     summary: Upload service media (images and video)
 *     tags: [Admin - Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 4
 *                 description: Service images (max 4)
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Service video (optional)
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     videoUrl:
 *                       type: string
 *       400:
 *         description: Validation error
 */
export const uploadServiceMedia = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || (!files.images && !files.video)) {
        throw new ValidationError('No files uploaded');
    }

    const processedImages: string[] = [];
    let videoUrl: string | undefined;

    try {
        // Process images
        if (files.images) {
            for (const imageFile of files.images) {
                // Process image with sharp (resize, optimize, convert to WebP)
                const processedFileName = `processed_${path.parse(imageFile.filename).name}.webp`;
                const processedPath = path.join(uploadsDir, processedFileName);

                await sharp(imageFile.path)
                    .resize(800, 600, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 85 })
                    .toFile(processedPath);

                // Delete original file
                fs.unlinkSync(imageFile.path);

                // Store relative URL
                const imageUrl = `/uploads/services/${processedFileName}`;
                processedImages.push(imageUrl);
            }
        }

        // Process video
        if (files.video && files.video[0]) {
            const videoFile = files.video[0];
            videoUrl = `/uploads/services/${videoFile.filename}`;
        }

        res.json({
            success: true,
            message: `Successfully uploaded ${processedImages.length} image${processedImages.length !== 1 ? 's' : ''}${videoUrl ? ' and 1 video' : ''}`,
            data: {
                images: processedImages,
                videoUrl
            }
        });

    } catch (error) {
        // Clean up files on error
        if (files.images) {
            files.images.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        if (files.video && files.video[0] && fs.existsSync(files.video[0].path)) {
            fs.unlinkSync(files.video[0].path);
        }

        throw error;
    }
});

/**
 * @swagger
 * /api/admin/upload/media/{filename}:
 *   delete:
 *     summary: Delete uploaded media file
 *     tags: [Admin - Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
export const deleteServiceMedia = asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params;

    if (!filename || filename.includes('..') || filename.includes('/')) {
        throw new ValidationError('Invalid filename');
    }

    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }

    fs.unlinkSync(filePath);

    res.json({
        success: true,
        message: 'File deleted successfully'
    });
});
