'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_addons', {
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
      additionalDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Additional minutes added to service',
      },
      additionalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Additional cost for this addon',
      },
      addonType: {
        type: Sequelize.ENUM('upgrade', 'extra', 'premium', 'treatment'),
        allowNull: false,
        defaultValue: 'extra',
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

    // Junction table for service-addon relationships
    await queryInterface.createTable('service_available_addons', {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
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
      addonId: {
        type: Sequelize.STRING(191),
        allowNull: false,
        references: {
          model: 'service_addons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isRecommended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('service_addons', ['addonType']);
    await queryInterface.addIndex('service_addons', ['isActive']);
    await queryInterface.addIndex('service_available_addons', ['serviceId']);
    await queryInterface.addIndex('service_available_addons', ['addonId']);
    await queryInterface.addIndex('service_available_addons', ['serviceId', 'addonId'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_available_addons');
    await queryInterface.dropTable('service_addons');
  }
};