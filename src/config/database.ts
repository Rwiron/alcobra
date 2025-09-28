import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration using environment variables
const sequelize = new Sequelize({
    database: process.env.DB_DATABASE || 'alcobrad_db',
    username: process.env.DB_USERNAME || 'alcobrad_dv',
    password: process.env.DB_PASSWORD || 'Dev@2002',
    host: process.env.DB_HOST || '64.31.22.50',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000,
    },
    dialectOptions: {
        connectTimeout: 60000,
    },
    retry: {
        match: [
            /ECONNRESET/,
            /ENOTFOUND/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
        ],
        max: 3
    },
});

// Test database connection
export const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully with Sequelize!');
        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

// Sync database (create tables)
export const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synced successfully!');
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        throw error;
    }
};

export default sequelize;
