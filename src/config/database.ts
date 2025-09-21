import { Sequelize } from 'sequelize';

// Database configuration
const sequelize = new Sequelize({
    database: 'alcobra_db',
    username: 'root',
    password: '', // No password for XAMPP default
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
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
