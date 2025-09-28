'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('transformations', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            beforeImage: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'before_image'
            },
            afterImage: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'after_image'
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                field: 'is_active'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at'
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at'
            }
        });

        // Add indexes
        await queryInterface.addIndex('transformations', ['is_active']);
        await queryInterface.addIndex('transformations', ['category']);
        await queryInterface.addIndex('transformations', ['created_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('transformations');
    }
};
