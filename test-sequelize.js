const { Sequelize } = require('sequelize');

// Test Sequelize connection
const sequelize = new Sequelize({
    database: 'alcobra_db',
    username: 'root',
    password: '',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
});

async function testSequelize() {
    try {
        console.log('🔍 Testing Sequelize connection...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Sequelize connected successfully!');

        // Test query
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('📊 Tables in database:', results);

        // Test if we can create tables
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Test table created successfully!');

        // Clean up test table
        await sequelize.query('DROP TABLE IF EXISTS test_table');
        console.log('🧹 Test table cleaned up');

        console.log('\n🎉 Sequelize test completed successfully!');

    } catch (error) {
        console.error('❌ Sequelize test failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

testSequelize();
