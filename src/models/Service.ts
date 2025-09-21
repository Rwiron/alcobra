import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import ServiceCategory from './ServiceCategory';

// Service attributes interface
export interface ServiceAttributes {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  duration: number; // in minutes
  price: number;
  minPrice?: number;
  maxPrice?: number;
  priceType: 'fixed' | 'variable' | 'consultation';
  serviceType: 'individual' | 'package' | 'addon';
  difficultyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  categoryId?: string;
  prerequisites?: string[];
  tags?: string[];
  preparationTime: number;
  cleanupTime: number;
  sortOrder: number;
  isActive: boolean;
  isBookable: boolean;
  requiresConsultation: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Service creation attributes
export interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Service model class
export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public slug?: string;
  public duration!: number;
  public price!: number;
  public minPrice?: number;
  public maxPrice?: number;
  public priceType!: 'fixed' | 'variable' | 'consultation';
  public serviceType!: 'individual' | 'package' | 'addon';
  public difficultyLevel!: 'basic' | 'intermediate' | 'advanced' | 'expert';
  public categoryId?: string;
  public prerequisites?: string[];
  public tags?: string[];
  public preparationTime!: number;
  public cleanupTime!: number;
  public sortOrder!: number;
  public isActive!: boolean;
  public isBookable!: boolean;
  public requiresConsultation!: boolean;
  public imageUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association with ServiceCategory
  public readonly category?: ServiceCategory;
}

// Initialize Service model
Service.init(
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: true,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    minPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    maxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    priceType: {
      type: DataTypes.ENUM('fixed', 'variable', 'consultation'),
      allowNull: false,
      defaultValue: 'fixed',
    },
    serviceType: {
      type: DataTypes.ENUM('individual', 'package', 'addon'),
      allowNull: false,
      defaultValue: 'individual',
    },
    difficultyLevel: {
      type: DataTypes.ENUM('basic', 'intermediate', 'advanced', 'expert'),
      allowNull: false,
      defaultValue: 'basic',
    },
    categoryId: {
      type: DataTypes.STRING(191),
      allowNull: true,
      references: {
        model: 'service_categories',
        key: 'id',
      },
    },
    prerequisites: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cleanupTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    isBookable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    requiresConsultation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    imageUrl: {
      type: DataTypes.STRING(191),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
  },
  {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: true,
  }
);

// Define associations
Service.belongsTo(ServiceCategory, { foreignKey: 'categoryId', as: 'category' });
ServiceCategory.hasMany(Service, { foreignKey: 'categoryId', as: 'services' });

export default Service;
