import { PrismaClient, House } from '@prisma/client'
import { awardPoints } from '../src/lib/leaderboard.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding dummy users for leaderboard...');
  const houses: House[] = ['RED', 'BLUE', 'GREEN', 'PURPLE']
  
  for (let i = 1; i <= 20; i++) {
    const house = houses[Math.floor(Math.random() * houses.length)];
    const points = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 points
    
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: `student${i}@test.com` }});
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `student${i}@test.com`,
          passwordHash: 'dummy',
          name: `Operative ${i}`,
          house: house,
          role: 'STUDENT',
          points: 0,
        }
      });
    }

    // Award points so it hits Redis
    await awardPoints(user.id, user.house, points, "Seeded test points");
    console.log(`Seeded ${user.name} with ${points} points in ${house}`);
  }
  
  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
