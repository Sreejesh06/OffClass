const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const syncs = await prisma.profileSync.findMany();
  console.log(JSON.stringify(syncs, null, 2));
}
main().finally(() => prisma.$disconnect());
