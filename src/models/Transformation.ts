import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface TransformationAttributes {
    id?: number;
    title: string;
    description?: string;
    beforeImage: string;
    afterImage: string;
    category?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Transformation extends Model<TransformationAttributes> implements TransformationAttributes {
    declare id?: number;
    declare title: string;
    declare description?: string;
    declare beforeImage: string;
    declare afterImage: string;
    declare category?: string;
    declare isActive?: boolean;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

Transformation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    beforeImage: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'before_image',
        validate: {
            notEmpty: true
        }
    },
    afterImage: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'after_image',
        validate: {
            notEmpty: true
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['hair', 'facial', 'nail', 'spa', 'makeup', 'other']]
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    sequelize,
    modelName: 'Transformation',
    tableName: 'transformations',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['is_active']
        },
        {
            fields: ['category']
        },
        {
            fields: ['created_at']
        }
    ]
});

export default Transformation;
