import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import { logAction } from "../lib/audit.js";

const router: IRouter = Router();

// Scoped export endpoint for students
router.get("/export/students", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const actorId = req.user!.userId;
    const actorRole = req.user!.role;

    // Fetch all students. 
    // This is strictly scoped so Teachers/Admins cannot accidentally export the internal PII (like 2FA secrets) of OTHER admins.
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        email: true,
        house: true,
        points: true,
        githubHandle: true,
        codeforcesHandle: true,
        htbHandle: true
      }
    });

    // Immutable forensic trail
    await logAction(
      actorId,
      "EXPORT_USERS",
      "SYSTEM",
      "ALL_STUDENTS",
      { resultCount: students.length, role: actorRole }
    );

    res.json({ students });
  } catch {
    res.status(500).json({ error: "Failed to export students" });
  }
});

export default router;
