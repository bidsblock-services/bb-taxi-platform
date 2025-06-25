// Seed script to add test data for development
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function seedDatabase() {
    console.log('🌱 Seeding database with test data...\n');
    
    try {
        // 1. Create a test taxi company
        console.log('1. Creating taxi company...');
        const company = await prisma.company.create({
            data: {
                name: 'Brussels Taxi Co.',
                address: 'Rue de la Loi 100, 1000 Brussels',
                phone: '+32 2 123 4567',
                email: 'info@brusselstaxi.be',
                taxNumber: 'BE0123456789',
                taxiLicenseNumber: 'TC-BRU-001',
                contactPersonName: 'John Doe',
                contactPersonEmail: 'john@brusselstaxi.be',
                contactPersonPhone: '+32 2 123 4567',
                chironClientId: 'test-chiron-key',
                chironClientSecret: 'test-chiron-secret',
                status: 'ACTIVE'
            }
        });
        console.log('✅ Company created:', company.name);
        
        // 2. Create test vehicles
        console.log('\n2. Creating vehicles...');
        const vehicle1 = await prisma.vehicle.create({
            data: {
                companyId: company.id,
                licensePlate: 'ABC-123',
                brand: 'Mercedes',
                model: 'E-Class',
                year: 2022,
                color: 'Black',
                taxiLicenseNumber: 'TXI-001',
                insuranceExpiry: new Date('2024-12-31'),
                keuringExpiry: new Date('2024-12-31'),
                pictures: JSON.stringify(['https://example.com/car1.jpg']),
                status: 'ACTIVE'
            }
        });
        
        const vehicle2 = await prisma.vehicle.create({
            data: {
                companyId: company.id,
                licensePlate: 'XYZ-789',
                brand: 'BMW',
                model: '5 Series',
                year: 2023,
                color: 'Silver',
                taxiLicenseNumber: 'TXI-002',
                insuranceExpiry: new Date('2024-12-31'),
                keuringExpiry: new Date('2024-12-31'),
                pictures: JSON.stringify(['https://example.com/car2.jpg']),
                status: 'ACTIVE'
            }
        });
        console.log('✅ Vehicles created:', vehicle1.licensePlate, vehicle2.licensePlate);
        
        // 3. Create test users and drivers
        console.log('\n3. Creating drivers...');
        const user1 = await prisma.user.create({
            data: {
                name: 'Jan Janssen',
                email: 'jan@brusselstaxi.be',
                role: 'DRIVER',
                phone: '+32 477 123 456'
            }
        });
        
        const driver1 = await prisma.driver.create({
            data: {
                userId: user1.id,
                firstName: 'Jan',
                lastName: 'Janssen',
                taxiDriverLicense: 'DL-001-2023',
                licenseExpiry: new Date('2026-12-31'),
                address: 'Chaussée de Louvain 10, 1000 Brussels',
                phone: '+32 477 123 456',
                email: 'jan@brusselstaxi.be',
                companyId: company.id,
                vehicleId: vehicle1.id,
                status: 'ACTIVE'
            }
        });
        
        const user2 = await prisma.user.create({
            data: {
                name: 'Pierre Dupont',
                email: 'pierre@brusselstaxi.be',
                role: 'DRIVER',
                phone: '+32 477 789 012'
            }
        });
        
        const driver2 = await prisma.driver.create({
            data: {
                userId: user2.id,
                firstName: 'Pierre',
                lastName: 'Dupont',
                taxiDriverLicense: 'DL-002-2023',
                licenseExpiry: new Date('2025-12-31'),
                address: 'Avenue Louise 50, 1000 Brussels',
                phone: '+32 477 789 012',
                email: 'pierre@brusselstaxi.be',
                companyId: company.id,
                vehicleId: vehicle2.id,
                status: 'ACTIVE'
            }
        });
        console.log('✅ Drivers created:', driver1.firstName + ' ' + driver1.lastName, driver2.firstName + ' ' + driver2.lastName);
        
        // 4. Create tariffs
        console.log('\n4. Creating tariffs...');
        const tariff = await prisma.tariff.create({
            data: {
                companyId: company.id,
                name: 'Standard Brussels Tariff',
                code: 'BRUSSELS_DAY',
                startPrice: 2.50,
                pricePerKm: 1.80,
                pricePerMinute: 0.50,
                nightStartTime: '22:00',
                nightEndTime: '06:00',
                isActive: true
            }
        });
        console.log('✅ Tariff created:', tariff.name);
        
        // 5. Add some sample locations for testing
        console.log('\n5. Adding driver locations...');
        await prisma.locationUpdate.create({
            data: {
                driverId: driver1.id,
                vehicleId: driver1.vehicleId,
                latitude: 50.8503,
                longitude: 4.3517,
                heading: 45,
                speed: 0
            }
        });
        
        await prisma.locationUpdate.create({
            data: {
                driverId: driver2.id,
                vehicleId: driver2.vehicleId,
                latitude: 50.8461,
                longitude: 4.3570,
                heading: 180,
                speed: 0
            }
        });
        console.log('✅ Driver locations added');
        
        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Test Data Summary:');
        console.log(`Company: ${company.name} (ID: ${company.id})`);
        console.log(`Vehicles: ${vehicle1.licensePlate}, ${vehicle2.licensePlate}`);
        console.log(`Drivers: ${driver1.name}, ${driver2.name}`);
        console.log(`Driver IDs for testing: ${driver1.id}, ${driver2.id}`);
        console.log(`Vehicle IDs for testing: ${vehicle1.id}, ${vehicle2.id}`);
        
        console.log('\n🔧 For API testing, use:');
        console.log(`Driver ID: ${driver1.id}`);
        console.log(`Vehicle ID: ${vehicle1.id}`);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeder
seedDatabase();

module.exports = { seedDatabase }; 