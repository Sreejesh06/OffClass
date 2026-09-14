import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating admin avatars...");

  // DiceBear Bottts with a dark slate background, slightly different tone
  const newAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=SystemAdminOverlord&backgroundColor=0f172a&primaryColor=f59e0b";

  const result = await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { avatar: newAvatar }
  });

  console.log(`Updated ${result.count} admins.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
