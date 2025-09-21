'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_categories', {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
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
      parentId: {
        type: Sequelize.STRING(191),
        allowNull: true,
        references: {
          model: 'service_categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      imageUrl: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      iconClass: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING(7), // Hex color code
        allowNull: true,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add indexes for better performance
    await queryInterface.addIndex('service_categories', ['parentId']);
    await queryInterface.addIndex('service_categories', ['slug']);
    await queryInterface.addIndex('service_categories', ['isActive']);
    await queryInterface.addIndex('service_categories', ['sortOrder']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_categories');
  }
};