const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const keys = await prisma.apiKey.findMany();
  console.log('Keys in DB:', keys);
}
check();
