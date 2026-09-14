import { PrismaClient, House } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const houses: House[] = ['RED', 'BLUE', 'GREEN', 'PURPLE']
  
  for (let i = 1; i <= 20; i++) {
    const house = houses[Math.floor(Math.random() * houses.length)];
    const points = Math.floor(Math.random() * 5000);
    
    await prisma.user.create({
      data: {
        email: `student${i}@test.com`,
        passwordHash: 'dummy',
        name: `Student ${i}`,
        house: house,
        role: 'STUDENT',
        points: points,
      }
    })
  }
  
  console.log("Seeded 20 students!");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
