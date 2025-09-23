import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ServiceCategory attributes interface
export interface ServiceCategoryAttributes {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
  iconClass?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ServiceCategory creation attributes
export interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// ServiceCategory model class
export class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare slug: string;
  declare parentId?: string;
  declare imageUrl?: string;
  declare iconClass?: string;
  declare color?: string;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association with self (parent-child)
  declare readonly parent?: ServiceCategory;
  declare readonly children?: ServiceCategory[];
}

// Initialize ServiceCategory model
ServiceCategory.init(
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.STRING(191),
      allowNull: true,
      references: {
        model: 'service_categories',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.STRING(191),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    iconClass: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7), // Hex color code
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Hex color validation
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ServiceCategory',
    tableName: 'service_categories',
    timestamps: true,
    underscored: false, // Use camelCase column names to match existing database
  }
);

// Define self-associations (parent-child relationships)
ServiceCategory.belongsTo(ServiceCategory, { foreignKey: 'parentId', as: 'parent' });
ServiceCategory.hasMany(ServiceCategory, { foreignKey: 'parentId', as: 'children' });

export default ServiceCategory;
