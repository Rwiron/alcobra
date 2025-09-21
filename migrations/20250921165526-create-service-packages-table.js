'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_packages', {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      slug: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },
      totalDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Total duration in minutes',
      },
      originalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Sum of individual service prices',
      },
      packagePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Discounted package price',
      },
      discountPercent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Discount percentage',
      },
      imageUrl: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of tags like ["popular", "new", "recommended"]',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Junction table for package-service relationships
    await queryInterface.createTable('package_services', {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
      },
      packageId: {
        type: Sequelize.STRING(191),
        allowNull: false,
        references: {
          model: 'service_packages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      serviceId: {
        type: Sequelize.STRING(191),
        allowNull: false,
        references: {
          model: 'services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      orderInPackage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order of service in the package',
      },
      isOptional: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this service is optional in the package',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('service_packages', ['isActive']);
    await queryInterface.addIndex('service_packages', ['sortOrder']);
    await queryInterface.addIndex('package_services', ['packageId']);
    await queryInterface.addIndex('package_services', ['serviceId']);
    await queryInterface.addIndex('package_services', ['packageId', 'serviceId'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('package_services');
    await queryInterface.dropTable('service_packages');
  }
};