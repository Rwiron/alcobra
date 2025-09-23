import { Request, Response } from 'express';
import multer from 'multer';
import cloudinary, { uploadOptions, generateImageUrls, deleteImage, extractPublicId } from '@/config/cloudinary';
import { asyncHandler, ValidationError } from '@/middleware/errorHandler';

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ValidationError('Only image files are allowed') as any, false);
    }
};

// Create multer upload middleware
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 5, // Max 5 files per request
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Images uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             images:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   publicId:
 *                     type: string
 *                     example: "alcobra-salon/services/facial-treatment"
 *                   originalUrl:
 *                     type: string
 *                     example: "https://res.cloudinary.com/rwaga/image/upload/v1234/alcobra-salon/services/facial-treatment.jpg"
 *                   urls:
 *                     type: object
 *                     properties:
 *                       original:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *                       medium:
 *                         type: string
 *                       large:
 *                         type: string
 */

/**
 * @swagger
 * /api/admin/upload:
 *   post:
 *     summary: Upload images to Cloudinary
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
 *         description: ID of the entity (service/category) for better organization
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
 *                 description: Image files to upload (max 5 files, 5MB each)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file type or upload error
 *       401:
 *         description: Unauthorized
 */
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const { type, entityId } = req.query;
    const files = req.files as Express.Multer.File[];

    // Validate upload type
    if (!type || !['service', 'category', 'profile'].includes(type as string)) {
        throw new ValidationError('Upload type must be: service, category, or profile');
    }

    if (!files || files.length === 0) {
        throw new ValidationError('No files uploaded');
    }

    // Get upload options based on type
    const options = uploadOptions[type as keyof typeof uploadOptions];

    try {
        const uploadPromises = files.map(async (file, index) => {
            // Generate unique filename
            const timestamp = Date.now();
            const filename = entityId
                ? `${entityId}-${timestamp}-${index}`
                : `${type}-${timestamp}-${index}`;

            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        ...options,
                        public_id: `${options.folder}/${filename}`,
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                uploadStream.end(file.buffer);
            });

            const uploadResult = result as any;

            return {
                publicId: uploadResult.public_id,
                originalUrl: uploadResult.secure_url,
                urls: generateImageUrls(uploadResult.public_id),
                width: uploadResult.width,
                height: uploadResult.height,
                format: uploadResult.format,
                bytes: uploadResult.bytes
            };
        });

        const uploadedImages = await Promise.all(uploadPromises);

        return res.json({
            success: true,
            message: `${uploadedImages.length} image(s) uploaded successfully`,
            data: {
                type,
                entityId,
                images: uploadedImages
            }
        });

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new ValidationError('Failed to upload images. Please try again.');
    }
});

/**
 * @swagger
 * /api/admin/upload/{publicId}:
 *   delete:
 *     summary: Delete image from Cloudinary
 *     tags: [Admin Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the image to delete (URL encoded)
 *     responses:
 *       200:
 *         description: Image deleted successfully
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
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Failed to delete image
 *       404:
 *         description: Image not found
 */
export const deleteImageById = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
        throw new ValidationError('Public ID is required');
    }

    // Decode the public ID (in case it was URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    try {
        const deleted = await deleteImage(decodedPublicId);

        if (deleted) {
            return res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            throw new ValidationError('Failed to delete image');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new ValidationError('Failed to delete image');
    }
});

/**
 * @swagger
 * /api/admin/upload/url-to-publicid:
 *   post:
 *     summary: Extract public ID from Cloudinary URL
 *     tags: [Admin Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/rwaga/image/upload/v1234/alcobra-salon/services/facial-treatment.jpg"
 *     responses:
 *       200:
 *         description: Public ID extracted successfully
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
 *                     publicId:
 *                       type: string
 *                       example: "alcobra-salon/services/facial-treatment"
 *                     originalUrl:
 *                       type: string
 *                     urls:
 *                       type: object
 */
export const extractPublicIdFromUrl = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        throw new ValidationError('Image URL is required');
    }

    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
        throw new ValidationError('Could not extract public ID from URL');
    }

    return res.json({
        success: true,
        data: {
            publicId,
            originalUrl: imageUrl,
            urls: generateImageUrls(publicId)
        }
    });
});

/**
 * @swagger
 * /api/admin/upload/generate-urls:
 *   post:
 *     summary: Generate responsive image URLs from public ID
 *     tags: [Admin Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 example: "alcobra-salon/services/facial-treatment"
 *     responses:
 *       200:
 *         description: URLs generated successfully
 */
export const generateResponsiveUrls = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.body;

    if (!publicId) {
        throw new ValidationError('Public ID is required');
    }

    const urls = generateImageUrls(publicId);

    return res.json({
        success: true,
        data: {
            publicId,
            urls
        }
    });
});
