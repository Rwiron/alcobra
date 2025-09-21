import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default admin user
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@alcobrasalon.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Alcobra Salon Admin';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.admin.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
        },
    });

    console.log('👤 Created admin user:', { id: admin.id, email: admin.email, name: admin.name });

    // Create sample services
    const services = [
        {
            name: 'Classic Haircut',
            description: 'Professional haircut with wash and basic styling',
            duration: 45,
            price: 35.00,
            category: 'Hair',
        },
        {
            name: 'Hair Color & Highlights',
            description: 'Full hair coloring service with highlights',
            duration: 120,
            price: 85.00,
            category: 'Hair',
        },
        {
            name: 'Deep Cleansing Facial',
            description: 'Relaxing facial with deep pore cleansing and moisturizing',
            duration: 60,
            price: 65.00,
            category: 'Spa',
        },
        {
            name: 'Swedish Massage',
            description: 'Full body relaxing Swedish massage',
            duration: 90,
            price: 95.00,
            category: 'Spa',
        },
        {
            name: 'Manicure & Pedicure',
            description: 'Complete nail care with polish application',
            duration: 75,
            price: 45.00,
            category: 'Nails',
        },
        {
            name: 'Eyebrow Shaping',
            description: 'Professional eyebrow shaping and trimming',
            duration: 30,
            price: 25.00,
            category: 'Beauty',
        },
    ];

    console.log('💅 Creating sample services...');

    for (const serviceData of services) {
        const service = await prisma.service.upsert({
            where: { name: serviceData.name },
            update: {},
            create: serviceData,
        });
        console.log(`✅ Created service: ${service.name} - $${service.price}`);
    }

    // Create sample bookings
    const sampleBookings = [
        {
            customerName: 'Sarah Johnson',
            customerPhone: '+1234567890',
            customerEmail: 'sarah@example.com',
            requestedDate: new Date('2024-01-15'),
            requestedTime: new Date('2024-01-15T10:00:00'),
            notes: 'First time customer, prefers shorter length',
            status: 'PENDING' as const,
        },
        {
            customerName: 'Mike Wilson',
            customerPhone: '+1234567891',
            customerEmail: 'mike@example.com',
            requestedDate: new Date('2024-01-16'),
            requestedTime: new Date('2024-01-16T14:30:00'),
            notes: 'Regular customer, usual style',
            status: 'CONFIRMED' as const,
        },
    ];

    console.log('📅 Creating sample bookings...');

    // Get first service for sample bookings
    const firstService = await prisma.service.findFirst();

    if (firstService) {
        for (const bookingData of sampleBookings) {
            const booking = await prisma.booking.create({
                data: {
                    ...bookingData,
                    serviceId: firstService.id,
                },
            });
            console.log(`📝 Created booking: ${booking.customerName} - ${booking.status}`);
        }
    }

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Admin created: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log(`💅 Services created: ${services.length}`);
    console.log(`📅 Sample bookings: ${sampleBookings.length}`);
    console.log('\n🚀 You can now start the server with: npm run dev');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
