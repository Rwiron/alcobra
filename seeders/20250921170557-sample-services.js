'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    // Add sample services
    await queryInterface.bulkInsert('services', [
      {
        id: 'srv-basic-cut',
        name: 'Basic Haircut',
        description: 'Classic haircut with wash and basic styling',
        slug: 'basic-haircut',
        duration: 45,
        price: 35.00,
        categoryId: 'cat-hair',
        serviceType: 'individual',
        difficultyLevel: 'basic',
        priceType: 'fixed',
        preparationTime: 5,
        cleanupTime: 5,
        sortOrder: 1,
        isActive: true,
        isBookable: true,
        requiresConsultation: false,
        tags: JSON.stringify(['popular', 'basic']),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'srv-premium-cut',
        name: 'Premium Cut & Style',
        description: 'Premium haircut with advanced styling and finishing',
        slug: 'premium-cut-style',
        duration: 75,
        price: 65.00,
        categoryId: 'cat-hair',
        serviceType: 'individual',
        difficultyLevel: 'advanced',
        priceType: 'fixed',
        preparationTime: 10,
        cleanupTime: 10,
        sortOrder: 2,
        isActive: true,
        isBookable: true,
        requiresConsultation: true,
        tags: JSON.stringify(['premium', 'recommended']),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'srv-deep-facial',
        name: 'Deep Cleansing Facial',
        description: 'Advanced facial with deep pore cleansing and moisturizing',
        slug: 'deep-cleansing-facial',
        duration: 75,
        price: 85.00,
        categoryId: 'cat-facial',
        serviceType: 'individual',
        difficultyLevel: 'intermediate',
        priceType: 'fixed',
        preparationTime: 10,
        cleanupTime: 10,
        sortOrder: 1,
        isActive: true,
        isBookable: true,
        requiresConsultation: false,
        tags: JSON.stringify(['deep-cleansing', 'recommended']),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'srv-color-consult',
        name: 'Hair Color Consultation',
        description: 'Professional hair color consultation with pricing estimate',
        slug: 'hair-color-consultation',
        duration: 30,
        price: 25.00,
        minPrice: 85.00,
        maxPrice: 200.00,
        categoryId: 'cat-hair',
        serviceType: 'individual',
        difficultyLevel: 'expert',
        priceType: 'consultation',
        preparationTime: 5,
        cleanupTime: 5,
        sortOrder: 3,
        isActive: true,
        isBookable: true,
        requiresConsultation: false,
        tags: JSON.stringify(['consultation', 'color']),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('✅ Sample services seeded successfully!');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', {
      id: ['srv-basic-cut', 'srv-premium-cut', 'srv-deep-facial', 'srv-color-consult']
    });
  }
};