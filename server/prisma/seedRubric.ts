import { PrismaClient } from '@prisma/client';
import { rubricData } from './rubricData';

const prisma = new PrismaClient();

async function seedRubricOnly() {
  console.log("Clearing existing rubric...");
  await prisma.pointsRubric.deleteMany();
  
  console.log("Seeding Points Rubric...");
  await prisma.pointsRubric.createMany({
    data: rubricData
  });
  
  console.log("Rubric seeded successfully.");
}

seedRubricOnly()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
