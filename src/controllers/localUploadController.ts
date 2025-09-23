import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { asyncHandler, ValidationError } from '@/middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/services',
        'uploads/categories',
        'uploads/profiles',
        'uploads/temp'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Initialize upload directories
createUploadDirs();

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { type } = req.query;
        let folder = 'uploads/temp';

        if (type === 'service') folder = 'uploads/services';
        else if (type === 'category') folder = 'uploads/categories';
        else if (type === 'profile') folder = 'uploads/profiles';

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const { entityId } = req.query;
        const uniqueId = uuidv4().slice(0, 8);
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);

        const filename = entityId
            ? `${entityId}-${timestamp}-${uniqueId}${ext}`
            : `${timestamp}-${uniqueId}${ext}`;

        cb(null, filename);
    }
});

// File filter for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new ValidationError('Only image files (JPEG, PNG, GIF, WebP) are allowed') as any, false);
    }
};

// Create multer upload middleware
export const uploadLocal = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5
    }
});

// Image processing with Sharp
const processImage = async (inputPath: string, outputDir: string, filename: string) => {
    const nameWithoutExt = path.parse(filename).name;
    const outputs = [];

    try {
        // Original (optimized)
        const originalPath = path.join(outputDir, `${nameWithoutExt}-original.webp`);
        await sharp(inputPath)
            .webp({ quality: 85 })
            .toFile(originalPath);
        outputs.push({ size: 'original', path: originalPath });

        // Large (800x600)
        const largePath = path.join(outputDir, `${nameWithoutExt}-large.webp`);
        await sharp(inputPath)
            .resize(800, 600, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(largePath);
        outputs.push({ size: 'large', path: largePath });

        // Medium (400x300)
        const mediumPath = path.join(outputDir, `${nameWithoutExt}-medium.webp`);
        await sharp(inputPath)
            .resize(400, 300, { fit: 'cover' })
            .webp({ quality: 75 })
            .toFile(mediumPath);
        outputs.push({ size: 'medium', path: mediumPath });

        // Thumbnail (150x150)
        const thumbPath = path.join(outputDir, `${nameWithoutExt}-thumb.webp`);
        await sharp(inputPath)
            .resize(150, 150, { fit: 'cover' })
            .webp({ quality: 70 })
            .toFile(thumbPath);
        outputs.push({ size: 'thumbnail', path: thumbPath });

        // Delete original uploaded file
        fs.unlinkSync(inputPath);

        return outputs;
    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
};

/**
 * @swagger
 * /api/admin/upload/local:
 *   post:
 *     summary: Upload images to local server storage
 *     tags: [Admin Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [service, category, profile]
 *         description: Type of image being uploaded
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *         description: ID of the entity for better organization
 *     requestBody:
 *       required: true
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
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
export const uploadImagesLocal = asyncHandler(async (req: Request, res: Response) => {
    const { type, entityId } = req.query;
    const files = req.files as Express.Multer.File[];

    if (!type || !['service', 'category', 'profile'].includes(type as string)) {
        throw new ValidationError('Upload type must be: service, category, or profile');
    }

    if (!files || files.length === 0) {
        throw new ValidationError('No files uploaded');
    }

    try {
        const processedImages = [];

        for (const file of files) {
            // Process each image to create multiple sizes
            const outputDir = path.dirname(file.path);
            const processed = await processImage(file.path, outputDir, file.filename);

            // Generate URLs for each size
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const urls: any = {};

            processed.forEach(({ size, path: filePath }) => {
                // Convert absolute path to relative URL
                const relativePath = filePath.replace(process.cwd() + '/', '');
                urls[size] = `${baseUrl}/${relativePath}`;
            });

            processedImages.push({
                filename: path.parse(file.filename).name,
                originalName: file.originalname,
                type: type as string,
                entityId: entityId as string,
                urls,
                uploadedAt: new Date().toISOString()
            });
        }

        return res.json({
            success: true,
            message: `${processedImages.length} image(s) uploaded and processed successfully`,
            data: {
                type,
                entityId,
                images: processedImages
            }
        });

    } catch (error) {
        console.error('Local upload error:', error);
        throw new ValidationError('Failed to process images. Please try again.');
    }
});

/**
 * @swagger
 * /api/admin/upload/local/{filename}:
 *   delete:
 *     summary: Delete local image files
 *     tags: [Admin Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Base filename (without size suffix and extension)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [service, category, profile]
 *     responses:
 *       200:
 *         description: Images deleted successfully
 */
export const deleteLocalImages = asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params;
    const { type } = req.query;

    if (!type || !['service', 'category', 'profile'].includes(type as string)) {
        throw new ValidationError('Type must be: service, category, or profile');
    }

    const folder = `uploads/${type}s`;
    const sizes = ['original', 'large', 'medium', 'thumb'];
    const deletedFiles: string[] = [];

    try {
        sizes.forEach(size => {
            const filePath = path.join(folder, `${filename}-${size}.webp`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deletedFiles.push(`${filename}-${size}.webp`);
            }
        });

        return res.json({
            success: true,
            message: `Deleted ${deletedFiles.length} image files`,
            data: { deletedFiles }
        });

    } catch (error) {
        console.error('Delete local images error:', error);
        throw new ValidationError('Failed to delete images');
    }
});
