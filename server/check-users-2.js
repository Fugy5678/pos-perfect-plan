const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
prisma.user.findMany().then(u => {
    fs.writeFileSync('users-utf8.json', JSON.stringify(u, null, 2), 'utf8');
    prisma.$disconnect();
});
