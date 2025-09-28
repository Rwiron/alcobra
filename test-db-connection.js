const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_DATABASE);
    console.log('Username:', process.env.DB_USERNAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            connectTimeout: 60000,
        });

        console.log('✅ Database connection successful!');

        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Test query successful:', rows);

        await connection.end();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error number:', error.errno);
    }
}

testConnection();
