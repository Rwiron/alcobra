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
  images?: string[]; // Array of image URLs
  videoUrl?: string; // Single video URL
  createdAt?: Date;
  updatedAt?: Date;
}

// Service creation attributes
export interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Service model class
export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare slug?: string;
  declare duration: number;
  declare price: number;
  declare minPrice?: number;
  declare maxPrice?: number;
  declare priceType: 'fixed' | 'variable' | 'consultation';
  declare serviceType: 'individual' | 'package' | 'addon';
  declare difficultyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  declare categoryId?: string;
  declare prerequisites?: string[];
  declare tags?: string[];
  declare preparationTime: number;
  declare cleanupTime: number;
  declare sortOrder: number;
  declare isActive: boolean;
  declare isBookable: boolean;
  declare requiresConsultation: boolean;
  declare imageUrl?: string;
  declare images?: string[]; // Array of image URLs
  declare videoUrl?: string; // Single video URL
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association with ServiceCategory
  declare readonly category?: ServiceCategory;
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
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of image URLs',
    },
    videoUrl: {
      type: DataTypes.STRING(191),
      allowNull: true,
      validate: {
        isUrl: true,
      },
      comment: 'Single video URL',
    },
  },
  {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: true,
    underscored: false, // Use camelCase column names to match existing database
  }
);

// Define associations
Service.belongsTo(ServiceCategory, { foreignKey: 'categoryId', as: 'category' });
ServiceCategory.hasMany(Service, { foreignKey: 'categoryId', as: 'services' });

export default Service;
