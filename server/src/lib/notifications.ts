import { prisma } from "./db.js";

export async function notifyUser(userId: string, title: string, message: string) {
  await prisma.notification.create({
    data: { userId, title, message }
  });
}

export async function notifyAdminsAndTeachers(title: string, message: string) {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "TEACHER"] } },
    select: { id: true }
  });
  
  if (staff.length > 0) {
    await prisma.notification.createMany({
      data: staff.map(s => ({
        userId: s.id,
        title,
        message
      }))
    });
  }
}
