import { v2 as cloudinary } from 'cloudinary';

// Debug: Log environment variables (without exposing secrets)
console.log('🔧 Cloudinary Config Debug:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ Set' : '❌ Missing');

// Cloudinary configuration
// Always configure explicitly to avoid ambiguity across environments
console.log('🔧 Applying explicit Cloudinary configuration');
// Sanitize env vars to avoid hidden spaces/newlines that break signatures
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

console.log('🔐 Cloudinary sanitized values:', {
    cloudNameLength: cloudName.length,
    apiKeyLength: apiKey.length,
    apiSecretLength: apiSecret.length,
});

// Verify configuration
const config = cloudinary.config();
console.log('📋 Cloudinary Config Loaded:');
console.log('Cloud Name:', config.cloud_name ? '✅ Loaded' : '❌ Not loaded');
console.log('API Key:', config.api_key ? '✅ Loaded' : '❌ Not loaded');
console.log('API Secret:', config.api_secret ? '✅ Loaded' : '❌ Not loaded');

export default cloudinary;

// Upload options for different image types
export const uploadOptions = {
    // Service images
    service: {
        folder: 'alcobra-salon/services',
        transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
            { format: 'auto' } // Auto format (WebP, AVIF when supported)
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 5000000, // 5MB
    },

    // Category images/icons
    category: {
        folder: 'alcobra-salon/categories',
        transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto:good' },
            { format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 2000000, // 2MB
    },

    // Profile/admin images
    profile: {
        folder: 'alcobra-salon/profiles',
        transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto:good' },
            { format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 1000000, // 1MB
    }
};

// Helper function to generate responsive image URLs
export const generateImageUrls = (publicId: string, baseTransformation?: any[]) => {
    const baseUrl = cloudinary.url(publicId, {
        transformation: baseTransformation || [{ quality: 'auto:good', format: 'auto' }]
    });

    return {
        original: baseUrl,
        thumbnail: cloudinary.url(publicId, {
            transformation: [
                { width: 150, height: 150, crop: 'fill' },
                { quality: 'auto:low', format: 'auto' }
            ]
        }),
        medium: cloudinary.url(publicId, {
            transformation: [
                { width: 400, height: 300, crop: 'fill' },
                { quality: 'auto:good', format: 'auto' }
            ]
        }),
        large: cloudinary.url(publicId, {
            transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto:good', format: 'auto' }
            ]
        })
    };
};

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return false;
    }
};

// Helper function to extract public_id from Cloudinary URL
export const extractPublicId = (imageUrl: string): string | null => {
    try {
        const regex = /\/(?:v\d+\/)?([^\.]+)/;
        const match = imageUrl.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public ID from URL:', error);
        return null;
    }
};
