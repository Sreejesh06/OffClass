import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (!student) throw new Error("No student");
  
  const opp = await prisma.opportunity.findFirst();
  if (!opp) throw new Error("No opp");
  
  console.log("Student:", student.email);
  console.log("Opp:", opp.title);
  
  const existing = await prisma.opportunityBookmark.findUnique({
    where: { userId_opportunityId: { userId: student.id, opportunityId: opp.id } }
  });
  console.log("Before:", existing);

  // Toggle on
  const created = await prisma.opportunityBookmark.create({
    data: {
      userId: student.id,
      opportunityId: opp.id,
      lookingForTeammate: false
    }
  });
  console.log("Created:", created);

  // Toggle off
  await prisma.opportunityBookmark.delete({ where: { id: created.id } });
  console.log("Deleted.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
