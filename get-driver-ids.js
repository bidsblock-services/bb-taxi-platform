const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function getDriverIds() {
    try {
        const drivers = await prisma.driver.findMany({
            include: {
                user: true
            }
        });
        
        console.log('🔧 Driver IDs for API testing:');
        drivers.forEach(d => {
            console.log(`Driver: ${d.firstName} ${d.lastName} - ID: ${d.id} - Vehicle: ${d.vehicleId}`);
        });
    } finally {
        await prisma.$disconnect();
    }
}

getDriverIds(); 