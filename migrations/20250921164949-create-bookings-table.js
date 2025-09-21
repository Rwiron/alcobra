'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
      },
      customerName: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      customerPhone: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      customerEmail: {
        type: Sequelize.STRING(191),
        allowNull: true,
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
      requestedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      requestedTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      confirmedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  }
};