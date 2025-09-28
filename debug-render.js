// Debug script to run on Render to diagnose connection issues
const mysql = require('mysql2/promise');
const net = require('net');
const dns = require('dns').promises;

async function debugRenderConnection() {
    console.log('🔍 RENDER DEBUG: Diagnosing connection issues...');
    console.log('');

    const host = '64.31.22.50';
    const port = 3306;
    const user = 'alcobrad_dv';
    const password = 'Dev@2002';
    const database = 'alcobrad_db';

    console.log('📋 Configuration:');
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   User: ${user}`);
    console.log('');

    // Test 1: DNS Resolution
    try {
        console.log('🔍 Test 1: DNS Resolution...');
        const resolved = await dns.lookup(host);
        console.log('✅ DNS Resolution successful:', resolved);
    } catch (error) {
        console.error('❌ DNS Resolution failed:', error.message);
    }

    // Test 2: Network Connectivity (TCP)
    try {
        console.log('🔍 Test 2: TCP Connection...');
        await new Promise((resolve, reject) => {
            const socket = net.createConnection(port, host);
            socket.setTimeout(10000);

            socket.on('connect', () => {
                console.log('✅ TCP Connection successful');
                socket.end();
                resolve();
            });

            socket.on('error', (error) => {
                console.error('❌ TCP Connection failed:', error.message);
                reject(error);
            });

            socket.on('timeout', () => {
                console.error('❌ TCP Connection timeout');
                socket.destroy();
                reject(new Error('Connection timeout'));
            });
        });
    } catch (error) {
        console.error('❌ TCP test failed:', error.message);
    }

    // Test 3: MySQL Connection
    try {
        console.log('🔍 Test 3: MySQL Connection...');
        const connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            database,
            connectTimeout: 30000,
        });

        console.log('✅ MySQL Connection successful');

        const [result] = await connection.execute('SELECT 1 as test');
        console.log('✅ MySQL Query successful:', result[0]);

        await connection.end();
        console.log('✅ MySQL Connection closed');

    } catch (error) {
        console.error('❌ MySQL Connection failed:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Errno:', error.errno);
        console.error('   SQL State:', error.sqlState);
    }

    // Test 4: Environment Variables
    console.log('🔍 Test 4: Environment Variables...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   PORT:', process.env.PORT);
    console.log('   DB_HOST:', process.env.DB_HOST);
    console.log('   DB_PORT:', process.env.DB_PORT);
    console.log('   DB_DATABASE:', process.env.DB_DATABASE);
    console.log('   DB_USERNAME:', process.env.DB_USERNAME);
    console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

    // Test 5: Network Information
    console.log('🔍 Test 5: Network Information...');
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();

    console.log('   Network Interfaces:');
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach(interface => {
            if (!interface.internal) {
                console.log(`     ${interfaceName}: ${interface.address} (${interface.family})`);
            }
        });
    });

    console.log('');
    console.log('🏁 Debug complete. Check results above for issues.');
}

debugRenderConnection().catch(console.error);
