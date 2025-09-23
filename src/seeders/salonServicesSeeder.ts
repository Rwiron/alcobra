import { ServiceCategory } from '@/models/ServiceCategory';
import { Service } from '@/models/Service';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcryptjs';

interface CategoryData {
    id: string;
    name: string;
    description: string;
    slug: string;
    color: string;
    iconClass: string;
    sortOrder: number;
}

interface ServiceData {
    name: string;
    description: string;
    slug: string;
    duration: number;
    price: number;
    priceType: 'fixed' | 'variable' | 'consultation';
    serviceType: 'individual' | 'package' | 'addon';
    difficultyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    categoryId: string;
    tags: string[];
    preparationTime: number;
    cleanupTime: number;
    sortOrder: number;
    isActive: boolean;
    isBookable: boolean;
    requiresConsultation: boolean;
}

export const seedSalonData = async () => {
    try {
        console.log('🌱 Starting salon data seeding...');

        // Create admin user if not exists
        const adminExists = await Admin.findOne({ where: { email: 'admin@alcobrasalon.com' } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await Admin.create({
                email: 'admin@alcobrasalon.com',
                password: hashedPassword,
                name: 'Alcobra Salon Admin',
                isActive: true
            });
            console.log('✅ Admin user created');
        }

        // Service Categories
        const categories: CategoryData[] = [
            {
                id: 'face-treatments',
                name: 'Face Treatments',
                description: 'Professional facial treatments and skincare services',
                slug: 'face-treatments',
                color: '#FF6B6B',
                iconClass: 'fas fa-spa',
                sortOrder: 1
            },
            {
                id: 'hair-services',
                name: 'Hair Services',
                description: 'Hair cutting, styling, coloring and treatments',
                slug: 'hair-services',
                color: '#4ECDC4',
                iconClass: 'fas fa-cut',
                sortOrder: 2
            },
            {
                id: 'nail-services',
                name: 'Nail Services',
                description: 'Manicure, pedicure and nail art services',
                slug: 'nail-services',
                color: '#45B7D1',
                iconClass: 'fas fa-hand-paper',
                sortOrder: 3
            },
            {
                id: 'body-treatments',
                name: 'Body Treatments',
                description: 'Full body massage and wellness treatments',
                slug: 'body-treatments',
                color: '#96CEB4',
                iconClass: 'fas fa-leaf',
                sortOrder: 4
            },
            {
                id: 'bridal-packages',
                name: 'Bridal Packages',
                description: 'Complete bridal beauty packages',
                slug: 'bridal-packages',
                color: '#FFEAA7',
                iconClass: 'fas fa-crown',
                sortOrder: 5
            },
            {
                id: 'mens-grooming',
                name: "Men's Grooming",
                description: 'Specialized grooming services for men',
                slug: 'mens-grooming',
                color: '#6C5CE7',
                iconClass: 'fas fa-male',
                sortOrder: 6
            }
        ];

        // Create categories
        for (const categoryData of categories) {
            const existingCategory = await ServiceCategory.findByPk(categoryData.id);
            if (!existingCategory) {
                await ServiceCategory.create(categoryData);
                console.log(`✅ Created category: ${categoryData.name}`);
            }
        }

        // Services
        const services: ServiceData[] = [
            // Face Treatments
            {
                name: 'Basic Facial Cleansing',
                description: 'Deep cleansing facial with steam and extraction for all skin types',
                slug: 'basic-facial-cleansing',
                duration: 45,
                price: 65.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'face-treatments',
                tags: ['facial', 'cleansing', 'basic'],
                preparationTime: 10,
                cleanupTime: 10,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Anti-Aging Facial',
                description: 'Advanced anti-aging facial with collagen mask and LED therapy',
                slug: 'anti-aging-facial',
                duration: 75,
                price: 120.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'advanced',
                categoryId: 'face-treatments',
                tags: ['facial', 'anti-aging', 'collagen', 'led-therapy'],
                preparationTime: 15,
                cleanupTime: 15,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Acne Treatment Facial',
                description: 'Specialized facial treatment for acne-prone skin with extraction',
                slug: 'acne-treatment-facial',
                duration: 60,
                price: 85.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'intermediate',
                categoryId: 'face-treatments',
                tags: ['facial', 'acne', 'treatment', 'extraction'],
                preparationTime: 10,
                cleanupTime: 15,
                sortOrder: 3,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },
            {
                name: 'Hydrating Face Mask',
                description: 'Intensive hydrating treatment with premium face mask',
                slug: 'hydrating-face-mask',
                duration: 30,
                price: 45.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'face-treatments',
                tags: ['facial', 'hydrating', 'mask'],
                preparationTime: 5,
                cleanupTime: 5,
                sortOrder: 4,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },

            // Hair Services
            {
                name: 'Hair Wash & Blow Dry',
                description: 'Professional hair washing and blow drying service',
                slug: 'hair-wash-blow-dry',
                duration: 45,
                price: 35.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'hair-services',
                tags: ['hair', 'wash', 'blow-dry'],
                preparationTime: 5,
                cleanupTime: 10,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Hair Cut & Style',
                description: 'Professional hair cutting and styling service',
                slug: 'hair-cut-style',
                duration: 75,
                price: 65.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'intermediate',
                categoryId: 'hair-services',
                tags: ['hair', 'cut', 'style'],
                preparationTime: 10,
                cleanupTime: 15,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Hair Coloring',
                description: 'Professional hair coloring service with premium products',
                slug: 'hair-coloring',
                duration: 150,
                price: 120.00,
                priceType: 'variable',
                serviceType: 'individual',
                difficultyLevel: 'advanced',
                categoryId: 'hair-services',
                tags: ['hair', 'coloring', 'dye'],
                preparationTime: 15,
                cleanupTime: 20,
                sortOrder: 3,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },
            {
                name: 'Hair Treatment & Conditioning',
                description: 'Deep conditioning treatment for damaged or dry hair',
                slug: 'hair-treatment-conditioning',
                duration: 60,
                price: 55.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'hair-services',
                tags: ['hair', 'treatment', 'conditioning'],
                preparationTime: 10,
                cleanupTime: 10,
                sortOrder: 4,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },

            // Nail Services
            {
                name: 'Classic Manicure',
                description: 'Traditional manicure with nail shaping, cuticle care, and polish',
                slug: 'classic-manicure',
                duration: 45,
                price: 35.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'nail-services',
                tags: ['nails', 'manicure', 'polish'],
                preparationTime: 5,
                cleanupTime: 10,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Gel Manicure',
                description: 'Long-lasting gel manicure with UV curing',
                slug: 'gel-manicure',
                duration: 60,
                price: 50.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'intermediate',
                categoryId: 'nail-services',
                tags: ['nails', 'manicure', 'gel', 'uv'],
                preparationTime: 10,
                cleanupTime: 10,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Classic Pedicure',
                description: 'Relaxing pedicure with foot soak, scrub, and polish',
                slug: 'classic-pedicure',
                duration: 60,
                price: 45.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'nail-services',
                tags: ['nails', 'pedicure', 'foot-care'],
                preparationTime: 10,
                cleanupTime: 10,
                sortOrder: 3,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Nail Art Design',
                description: 'Custom nail art and design service',
                slug: 'nail-art-design',
                duration: 90,
                price: 75.00,
                priceType: 'variable',
                serviceType: 'individual',
                difficultyLevel: 'expert',
                categoryId: 'nail-services',
                tags: ['nails', 'art', 'design', 'custom'],
                preparationTime: 15,
                cleanupTime: 15,
                sortOrder: 4,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },

            // Body Treatments
            {
                name: 'Relaxing Full Body Massage',
                description: 'Full body relaxation massage with aromatherapy oils',
                slug: 'relaxing-full-body-massage',
                duration: 90,
                price: 110.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'intermediate',
                categoryId: 'body-treatments',
                tags: ['massage', 'relaxation', 'aromatherapy'],
                preparationTime: 15,
                cleanupTime: 15,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Deep Tissue Massage',
                description: 'Therapeutic deep tissue massage for muscle tension relief',
                slug: 'deep-tissue-massage',
                duration: 75,
                price: 95.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'advanced',
                categoryId: 'body-treatments',
                tags: ['massage', 'deep-tissue', 'therapeutic'],
                preparationTime: 10,
                cleanupTime: 15,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },

            // Bridal Packages
            {
                name: 'Bridal Makeup Trial',
                description: 'Complete bridal makeup trial session',
                slug: 'bridal-makeup-trial',
                duration: 120,
                price: 85.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'expert',
                categoryId: 'bridal-packages',
                tags: ['bridal', 'makeup', 'trial'],
                preparationTime: 15,
                cleanupTime: 20,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },
            {
                name: 'Complete Bridal Package',
                description: 'Full bridal package including hair, makeup, and nail services',
                slug: 'complete-bridal-package',
                duration: 240,
                price: 350.00,
                priceType: 'package',
                serviceType: 'package',
                difficultyLevel: 'expert',
                categoryId: 'bridal-packages',
                tags: ['bridal', 'package', 'complete', 'hair', 'makeup', 'nails'],
                preparationTime: 30,
                cleanupTime: 30,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: true
            },

            // Men's Grooming
            {
                name: 'Mens Haircut',
                description: 'Professional mens haircut and styling',
                slug: 'mens-haircut',
                duration: 45,
                price: 35.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'basic',
                categoryId: 'mens-grooming',
                tags: ['mens', 'haircut', 'grooming'],
                preparationTime: 5,
                cleanupTime: 10,
                sortOrder: 1,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            },
            {
                name: 'Beard Trim & Shape',
                description: 'Professional beard trimming and shaping service',
                slug: 'beard-trim-shape',
                duration: 30,
                price: 25.00,
                priceType: 'fixed',
                serviceType: 'individual',
                difficultyLevel: 'intermediate',
                categoryId: 'mens-grooming',
                tags: ['mens', 'beard', 'trim', 'grooming'],
                preparationTime: 5,
                cleanupTime: 10,
                sortOrder: 2,
                isActive: true,
                isBookable: true,
                requiresConsultation: false
            }
        ];

        // Create services
        for (const serviceData of services) {
            const existingService = await Service.findOne({ where: { slug: serviceData.slug } });
            if (!existingService) {
                await Service.create(serviceData);
                console.log(`✅ Created service: ${serviceData.name}`);
            }
        }

        console.log('🎉 Salon data seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`• ${categories.length} categories created`);
        console.log(`• ${services.length} services created`);
        console.log('• Admin user: admin@alcobrasalon.com (password: admin123)');

    } catch (error) {
        console.error('❌ Error seeding salon data:', error);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedSalonData()
        .then(() => {
            console.log('✅ Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
