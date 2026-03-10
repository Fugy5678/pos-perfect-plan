import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Super Admin user
    const superAdminPass = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'fujimoryc@gmail.com' },
        update: {},
        create: {
            name: 'Fujimory',
            email: 'fujimoryc@gmail.com',
            password: superAdminPass,
            role: 'SUPER_ADMIN',
        },
    });
    console.log(`✅ Super Admin user: ${superAdmin.email}`);

    // Create Admin users
    const adminNames = ['Millow', 'Denno', 'Waweru', 'Njoro'];
    for (const name of adminNames) {
        const email = `${name.toLowerCase()}@perfectplan.com`;
        const pass = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { name, email, password: pass, role: 'ADMIN' },
        });
        console.log(`✅ Admin user: ${email}`);
    }

    // Seed products from original data
    const products = [
        // FOOTWEAR
        { name: 'Coudry Green', sku: 'FW-001', category: 'FOOTWEAR', qty: 1, reorder: 2, sellPrice: 3500, costPrice: 2000 },
        { name: 'SB Green', sku: 'FW-002', category: 'FOOTWEAR', qty: 1, reorder: 3, sellPrice: 4500, costPrice: 2800 },
        { name: 'Dr Martens', sku: 'FW-003', category: 'FOOTWEAR', qty: 1, reorder: 2, sellPrice: 8500, costPrice: 5500 },
        { name: 'Coudry Brown', sku: 'FW-004', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 3500, costPrice: 2000 },
        { name: 'Timber Boot Blue', sku: 'FW-005', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 6500, costPrice: 4000 },
        { name: 'Samba White', sku: 'FW-006', category: 'FOOTWEAR', qty: 24, reorder: 10, sellPrice: 5500, costPrice: 3200 },
        { name: 'Samba Valentines', sku: 'FW-007', category: 'FOOTWEAR', qty: 1, reorder: 2, sellPrice: 5800, costPrice: 3400 },
        { name: 'SB Whisper', sku: 'FW-008', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 4500, costPrice: 2800 },
        { name: 'Airforce White', sku: 'FW-009', category: 'FOOTWEAR', qty: 2, reorder: 3, sellPrice: 5000, costPrice: 3000 },
        { name: 'Converse Leather White', sku: 'FW-010', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 4200, costPrice: 2500 },
        { name: 'Chrome Hearts Brown', sku: 'FW-011', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 7500, costPrice: 4800 },
        { name: 'J9 Grey White', sku: 'FW-012', category: 'FOOTWEAR', qty: 1, reorder: 3, sellPrice: 8000, costPrice: 5200 },
        { name: 'J9 Black Yellow', sku: 'FW-013', category: 'FOOTWEAR', qty: 1, reorder: 2, sellPrice: 8000, costPrice: 5200 },
        { name: 'Black Cat F88', sku: 'FW-014', category: 'FOOTWEAR', qty: 3, reorder: 4, sellPrice: 7800, costPrice: 5000 },
        { name: 'Puma Jogger Navy', sku: 'FW-015', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 4000, costPrice: 2400 },
        { name: 'Puma Jogger Black Red', sku: 'FW-016', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 4000, costPrice: 2400 },
        { name: 'NB 530 Blue', sku: 'FW-017', category: 'FOOTWEAR', qty: 16, reorder: 10, sellPrice: 5500, costPrice: 3300 },
        { name: 'NB 530 Black', sku: 'FW-018', category: 'FOOTWEAR', qty: 0, reorder: 2, sellPrice: 5500, costPrice: 3300 },
        { name: 'SB Ottomo', sku: 'FW-019', category: 'FOOTWEAR', qty: 1, reorder: 2, sellPrice: 4800, costPrice: 2900 },
        { name: 'Converse White', sku: 'FW-020', category: 'FOOTWEAR', qty: 3, reorder: 3, sellPrice: 3800, costPrice: 2200 },
        { name: 'Airforce Bandana F25', sku: 'FW-037', category: 'FOOTWEAR', qty: 9, reorder: 5, sellPrice: 5500, costPrice: 3300 },
        { name: 'Nike Zoom Black Grey', sku: 'FW-031', category: 'FOOTWEAR', qty: 38, reorder: 15, sellPrice: 6500, costPrice: 4000 },
        { name: 'Samba Black White F25', sku: 'FW-062', category: 'FOOTWEAR', qty: 15, reorder: 8, sellPrice: 5500, costPrice: 3200 },
        { name: 'Timber Brown F25', sku: 'FW-065', category: 'FOOTWEAR', qty: 54, reorder: 15, sellPrice: 6500, costPrice: 4000 },
        { name: 'NB 530 White Black', sku: 'FW-066', category: 'FOOTWEAR', qty: 19, reorder: 15, sellPrice: 5500, costPrice: 3300 },
        { name: 'J4 Black Cat F25', sku: 'FW-046', category: 'FOOTWEAR', qty: 27, reorder: 10, sellPrice: 8000, costPrice: 5200 },
        { name: 'Chrome Hearts Black', sku: 'FW-045', category: 'FOOTWEAR', qty: 29, reorder: 10, sellPrice: 7500, costPrice: 4800 },
        { name: 'Tightbooth', sku: 'FW-043', category: 'FOOTWEAR', qty: 36, reorder: 12, sellPrice: 5000, costPrice: 3000 },
        { name: 'SB Para', sku: 'FW-055', category: 'FOOTWEAR', qty: 36, reorder: 12, sellPrice: 4800, costPrice: 2900 },
        { name: 'Adidas Campus', sku: 'FW-056', category: 'FOOTWEAR', qty: 22, reorder: 8, sellPrice: 5200, costPrice: 3100 },
        { name: 'Converse Leather Black', sku: 'FW-057', category: 'FOOTWEAR', qty: 31, reorder: 10, sellPrice: 4200, costPrice: 2500 },
        { name: 'Converse Leather Black White', sku: 'FW-058', category: 'FOOTWEAR', qty: 33, reorder: 10, sellPrice: 4200, costPrice: 2500 },
        { name: 'Boot Heel Multicolour', sku: 'FW-041', category: 'FOOTWEAR', qty: 28, reorder: 10, sellPrice: 6000, costPrice: 3600 },
        { name: 'Purple Pigeon', sku: 'FW-032', category: 'FOOTWEAR', qty: 22, reorder: 10, sellPrice: 5500, costPrice: 3300 },
        { name: 'Zoom X Pink', sku: 'FW-024', category: 'FOOTWEAR', qty: 14, reorder: 10, sellPrice: 6500, costPrice: 4000 },
        // CLOTHING
        { name: 'Kids Jersey', sku: 'CL-001', category: 'CLOTHING', qty: 0, reorder: 10, sellPrice: 1500, costPrice: 800 },
        { name: 'Fan Jerseys', sku: 'CL-002', category: 'CLOTHING', qty: 46, reorder: 30, sellPrice: 2000, costPrice: 1100 },
        { name: 'PV Jerseys', sku: 'CL-003', category: 'CLOTHING', qty: 7, reorder: 15, sellPrice: 2200, costPrice: 1200 },
        { name: 'Gym Sets', sku: 'CL-004', category: 'CLOTHING', qty: 52, reorder: 20, sellPrice: 3500, costPrice: 2000 },
        { name: 'Tracks', sku: 'CL-005', category: 'CLOTHING', qty: 2, reorder: 15, sellPrice: 2800, costPrice: 1600 },
        { name: 'Kids PJ', sku: 'CL-006', category: 'CLOTHING', qty: 23, reorder: 12, sellPrice: 1800, costPrice: 1000 },
        { name: 'Adults PJ', sku: 'CL-007', category: 'CLOTHING', qty: 1, reorder: 12, sellPrice: 2200, costPrice: 1200 },
        // ACCESSORIES
        { name: 'Smart Watch', sku: 'AC-001', category: 'ACCESSORIES', qty: 9, reorder: 5, sellPrice: 4500, costPrice: 2500 },
        { name: 'Headphones', sku: 'AC-002', category: 'ACCESSORIES', qty: 10, reorder: 5, sellPrice: 3500, costPrice: 2000 },
        { name: 'LV Bag', sku: 'AC-003', category: 'ACCESSORIES', qty: 193, reorder: 50, sellPrice: 8500, costPrice: 5500 },
        // HOME
        { name: 'Cutlery Set', sku: 'HM-001', category: 'HOME', qty: 9, reorder: 5, sellPrice: 2500, costPrice: 1400 },
        { name: 'Thermos Gift Set', sku: 'HM-002', category: 'HOME', qty: 9, reorder: 5, sellPrice: 3000, costPrice: 1800 },
        { name: 'Coffee Maker', sku: 'HM-003', category: 'HOME', qty: 18, reorder: 8, sellPrice: 5500, costPrice: 3300 },
        { name: 'Porcelain Pots', sku: 'HM-004', category: 'HOME', qty: 9, reorder: 5, sellPrice: 2000, costPrice: 1100 },
        { name: 'Kitchenware Sets', sku: 'HM-005', category: 'HOME', qty: 9, reorder: 5, sellPrice: 4500, costPrice: 2700 },
        { name: 'Clothes Organizer Grey', sku: 'HM-006', category: 'HOME', qty: 9, reorder: 5, sellPrice: 1800, costPrice: 1000 },
        { name: 'Checked Clothes Organizer', sku: 'HM-007', category: 'HOME', qty: 18, reorder: 8, sellPrice: 1800, costPrice: 1000 },
        { name: 'Soap Handwash', sku: 'HM-008', category: 'HOME', qty: 45, reorder: 15, sellPrice: 500, costPrice: 250 },
        { name: 'Kitchen Soap Dispenser', sku: 'HM-009', category: 'HOME', qty: 27, reorder: 10, sellPrice: 800, costPrice: 400 },
        { name: 'Kitchen Mat', sku: 'HM-010', category: 'HOME', qty: 18, reorder: 8, sellPrice: 1500, costPrice: 850 },
        { name: 'Pillowcase', sku: 'HM-011', category: 'HOME', qty: 63, reorder: 20, sellPrice: 600, costPrice: 300 },
        { name: 'Men Gift Set', sku: 'HM-012', category: 'HOME', qty: 9, reorder: 5, sellPrice: 3500, costPrice: 2000 },
        { name: 'Bedside Table', sku: 'HM-013', category: 'HOME', qty: 27, reorder: 10, sellPrice: 4500, costPrice: 2700 },
        { name: 'Stanley Cup Flower', sku: 'HM-014', category: 'HOME', qty: 12, reorder: 6, sellPrice: 2800, costPrice: 1600 },
        { name: 'Stanley Cup Gift Set', sku: 'HM-015', category: 'HOME', qty: 9, reorder: 5, sellPrice: 3500, costPrice: 2000 },
        { name: 'Corner Shelf', sku: 'HM-016', category: 'HOME', qty: 18, reorder: 8, sellPrice: 3000, costPrice: 1800 },
        { name: 'Kitchen Rack', sku: 'HM-017', category: 'HOME', qty: 18, reorder: 8, sellPrice: 2500, costPrice: 1400 },
        { name: 'Oil Dispenser', sku: 'HM-018', category: 'HOME', qty: 18, reorder: 8, sellPrice: 800, costPrice: 400 },
    ];

    let created = 0;
    for (const p of products) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: p,
        });
        created++;
    }
    console.log(`✅ Seeded ${created} products`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
