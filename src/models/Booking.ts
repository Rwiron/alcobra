import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import Service from './Service';

// Booking status enum
export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

// Booking attributes interface
export interface BookingAttributes {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    requestedDate: Date;
    requestedTime: Date;
    status: BookingStatus;
    notes?: string;
    adminNotes?: string;
    confirmedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Booking creation attributes
export interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Booking model class
export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    public id!: string;
    public customerName!: string;
    public customerPhone!: string;
    public customerEmail?: string;
    public serviceId!: string;
    public requestedDate!: Date;
    public requestedTime!: Date;
    public status!: BookingStatus;
    public notes?: string;
    public adminNotes?: string;
    public confirmedAt?: Date;
    public completedAt?: Date;
    public cancelledAt?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Association with Service
    public readonly service?: Service;
}

// Initialize Booking model
Booking.init(
    {
        id: {
            type: DataTypes.STRING(191),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        customerName: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        customerPhone: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        customerEmail: {
            type: DataTypes.STRING(191),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        serviceId: {
            type: DataTypes.STRING(191),
            allowNull: false,
            references: {
                model: 'services',
                key: 'id',
            },
        },
        requestedDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        requestedTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(BookingStatus)),
            allowNull: false,
            defaultValue: BookingStatus.PENDING,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        confirmedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Booking',
        tableName: 'bookings',
        timestamps: true,
    }
);

// Define associations
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });

export default Booking;
