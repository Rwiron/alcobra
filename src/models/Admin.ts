import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';

// Admin attributes interface
export interface AdminAttributes {
    id: string;
    email: string;
    password: string;
    name: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Admin creation attributes (optional id, timestamps)
export interface AdminCreationAttributes extends Optional<AdminAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Admin model class
export class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
    public id!: string;
    public email!: string;
    public password!: string;
    public name!: string;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize Admin model
Admin.init(
    {
        id: {
            type: DataTypes.STRING(191),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        email: {
            type: DataTypes.STRING(191),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Admin',
        tableName: 'admins',
        timestamps: true,
    }
);

export default Admin;
