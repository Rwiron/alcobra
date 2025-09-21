const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');

        // Test connection
        await prisma.$connect();
        console.log('✅ Database connected successfully!');

        // Test if tables exist by counting admins
        const adminCount = await prisma.admin.count();
        console.log(`👤 Found ${adminCount} admin(s) in database`);

        // Test if services exist
        const serviceCount = await prisma.service.count();
        console.log(`💅 Found ${serviceCount} service(s) in database`);

        // Show first admin
        if (adminCount > 0) {
            const admin = await prisma.admin.findFirst();
            console.log(`📧 Admin email: ${admin.email}`);
        }

        // Show services
        if (serviceCount > 0) {
            const services = await prisma.service.findMany();
            console.log('🏪 Services:');
            services.forEach(service => {
                console.log(`   - ${service.name}: $${service.price} (${service.duration}min)`);
            });
        }

        console.log('\n🎉 Database test completed successfully!');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();
