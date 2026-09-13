import { execSync } from 'child_process';
import { PrismaClient } from '../server/node_modules/@prisma/client';
import bcrypt from 'bcryptjs';

export default async function globalSetup() {
  console.log('🔄 Setting up E2E Test Database...');

  // 1. Push schema to the test database
  execSync('cd ../server && pnpm prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DATABASE_URL
    }
  });

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });

  try {
    // 2. Clear existing data
    await prisma.user.deleteMany();
    await prisma.perkItem.deleteMany();
    
    // 3. Seed users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await prisma.user.createMany({
      data: [
        {
          id: 'student-1',
          email: 'student@sece.ac.in',
          name: 'Test Student',
          passwordHash,
          role: 'STUDENT',
          house: 'RED',
          points: 500,
        },
        {
          id: 'teacher-1',
          email: 'teacher@sece.ac.in',
          name: 'Test Teacher',
          passwordHash,
          role: 'TEACHER',
          house: 'BLUE',
          points: 0,
        },
        {
          id: 'admin-1',
          email: 'admin@sece.ac.in',
          name: 'Test Admin',
          passwordHash,
          role: 'ADMIN',
          house: 'GREEN',
          points: 0,
        }
      ]
    });

    // 4. Seed Perks
    await prisma.perkItem.create({
      data: {
        id: 'perk-1',
        name: 'Test Sticker Pack',
        description: 'A test perk',
        cost: 100,
        quantityRemaining: 10,
        isActive: true,
      }
    });

    console.log('✅ Test database seeded successfully.');
  } finally {
    await prisma.$disconnect();
  }
}
