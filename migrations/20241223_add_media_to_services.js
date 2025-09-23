'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('services', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of image URLs'
    });

    await queryInterface.addColumn('services', 'videoUrl', {
      type: Sequelize.STRING(191),
      allowNull: true,
      comment: 'Single video URL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('services', 'images');
    await queryInterface.removeColumn('services', 'videoUrl');
  }
};
