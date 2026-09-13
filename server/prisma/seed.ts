import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Wipe existing data (Be careful in production, this is just for dev setup)
  await prisma.complaint.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.perkItem.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sece.ac.in',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      house: 'PURPLE',
      points: 9999
    }
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@sece.ac.in',
      name: 'Prof. Security',
      passwordHash,
      role: 'TEACHER',
      house: 'BLUE',
      points: 5000
    }
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@sece.ac.in',
      name: 'Alex Cipher',
      passwordHash,
      role: 'STUDENT',
      house: 'RED',
      points: 1250,
      bio: 'Enthusiastic about web exploitation and CTFs.'
    }
  });

  // Create 100 mock students for the leaderboard
  const houses = ['RED', 'BLUE', 'GREEN', 'PURPLE'] as const;
  const mockStudents = [];
  for (let i = 0; i < 100; i++) {
    mockStudents.push({
      email: `student${i}@sece.ac.in`,
      name: `Agent ${i}`,
      passwordHash,
      role: 'STUDENT' as const,
      house: houses[i % 4],
      points: Math.floor(Math.random() * 5000)
    });
  }
  await prisma.user.createMany({ data: mockStudents });

  // 3. Create Perks
  await prisma.perkItem.createMany({
    data: [
      { name: "Priority Workshop Registration", description: "Get guaranteed access to the next limited-seat workshop.", cost: 500, quantityRemaining: 50 },
      { name: "Off-Duty Pass", description: "Get a half-day OD for CTF preparation.", cost: 1500, quantityRemaining: 10 },
      { name: "Exclusive Hoodie", description: "Official OffClass Hacker Hoodie.", cost: 5000, quantityRemaining: 5 },
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
