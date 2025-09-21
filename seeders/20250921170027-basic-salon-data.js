'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 12);
    await queryInterface.bulkInsert('admins', [{
      id: 'admin-001',
      email: 'admin@alcobrasalon.com',
      password: adminPassword,
      name: 'Alcobra Salon Admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }]);

    // 2. Create Main Service Categories
    await queryInterface.bulkInsert('service_categories', [
      {
        id: 'cat-hair',
        name: 'Hair Services',
        description: 'Professional hair care and styling',
        slug: 'hair-services',
        parentId: null,
        iconClass: 'fas fa-cut',
        color: '#FF6B6B',
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-spa',
        name: 'Spa & Wellness',
        description: 'Relaxation and therapeutic treatments',
        slug: 'spa-wellness',
        parentId: null,
        iconClass: 'fas fa-spa',
        color: '#4ECDC4',
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'cat-beauty',
        name: 'Beauty Services',
        description: 'Cosmetic and beauty enhancement',
        slug: 'beauty-services',
        parentId: null,
        iconClass: 'fas fa-palette',
        color: '#45B7D1',
        sortOrder: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Sub-category example: Facial under Spa
      {
        id: 'cat-facial',
        name: 'Facial Treatments',
        description: 'Face care and skin treatments',
        slug: 'facial-treatments',
        parentId: 'cat-spa',
        iconClass: 'fas fa-smile',
        color: '#7FCDFF',
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('✅ Basic salon data seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_categories', null, {});
    await queryInterface.bulkDelete('admins', null, {});
  }
};