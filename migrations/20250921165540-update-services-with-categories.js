'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to services table
    await queryInterface.addColumn('services', 'categoryId', {
      type: Sequelize.STRING(191),
      allowNull: true,
      references: {
        model: 'service_categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('services', 'slug', {
      type: Sequelize.STRING(191),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('services', 'serviceType', {
      type: Sequelize.ENUM('individual', 'package', 'addon'),
      allowNull: false,
      defaultValue: 'individual',
    });

    await queryInterface.addColumn('services', 'difficultyLevel', {
      type: Sequelize.ENUM('basic', 'intermediate', 'advanced', 'expert'),
      allowNull: false,
      defaultValue: 'basic',
    });

    await queryInterface.addColumn('services', 'prerequisites', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of required service IDs that must be completed first',
    });

    await queryInterface.addColumn('services', 'tags', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of tags like ["popular", "new", "recommended"]',
    });

    await queryInterface.addColumn('services', 'minPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Minimum price for variable pricing services',
    });

    await queryInterface.addColumn('services', 'maxPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Maximum price for variable pricing services',
    });

    await queryInterface.addColumn('services', 'priceType', {
      type: Sequelize.ENUM('fixed', 'variable', 'consultation'),
      allowNull: false,
      defaultValue: 'fixed',
    });

    await queryInterface.addColumn('services', 'preparationTime', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Preparation time in minutes before service starts',
    });

    await queryInterface.addColumn('services', 'cleanupTime', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Cleanup time in minutes after service ends',
    });

    await queryInterface.addColumn('services', 'sortOrder', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('services', 'isBookable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this service can be booked directly',
    });

    await queryInterface.addColumn('services', 'requiresConsultation', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Add indexes for better performance
    await queryInterface.addIndex('services', ['categoryId']);
    await queryInterface.addIndex('services', ['serviceType']);
    await queryInterface.addIndex('services', ['isBookable']);
    await queryInterface.addIndex('services', ['sortOrder']);
    await queryInterface.addIndex('services', ['slug']);

    // Remove the old category column (it was just a string)
    await queryInterface.removeColumn('services', 'category');
  },

  async down(queryInterface, Sequelize) {
    // Remove all the new columns
    await queryInterface.removeColumn('services', 'categoryId');
    await queryInterface.removeColumn('services', 'slug');
    await queryInterface.removeColumn('services', 'serviceType');
    await queryInterface.removeColumn('services', 'difficultyLevel');
    await queryInterface.removeColumn('services', 'prerequisites');
    await queryInterface.removeColumn('services', 'tags');
    await queryInterface.removeColumn('services', 'minPrice');
    await queryInterface.removeColumn('services', 'maxPrice');
    await queryInterface.removeColumn('services', 'priceType');
    await queryInterface.removeColumn('services', 'preparationTime');
    await queryInterface.removeColumn('services', 'cleanupTime');
    await queryInterface.removeColumn('services', 'sortOrder');
    await queryInterface.removeColumn('services', 'isBookable');
    await queryInterface.removeColumn('services', 'requiresConsultation');

    // Add back the old category column
    await queryInterface.addColumn('services', 'category', {
      type: Sequelize.STRING(191),
      allowNull: true,
    });
  }
};