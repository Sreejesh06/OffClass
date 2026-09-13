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
        profileLinks: { select: { provider: true, externalHandle: true, verified: true } },
      },
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

router.get("/approvals", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const certs = await prisma.certificate.findMany({
      where: { status: "UPLOADED" },
      include: { user: { select: { name: true, house: true } } }
    });
    
    // Map to a generic approval item format for the frontend
    const approvals = certs.map(c => ({
      id: c.id,
      type: "CERTIFICATE",
      studentName: c.user.name,
      studentHouse: c.user.house,
      description: `Certificate uploaded: ${c.name}`,
      date: c.createdAt.toISOString()
    }));

    res.json({ approvals });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
});

router.post("/approve", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, action } = req.body; // items = [id1, id2], action = 'approve' | 'reject'
    if (!Array.isArray(items) || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ error: "Invalid request payload" });
      return;
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    await prisma.certificate.updateMany({
      where: { id: { in: items } },
      data: { status: newStatus, reviewedBy: req.user!.userId }
    });

    if (action === 'approve') {
      // Award points for approved certificates
      const certs = await prisma.certificate.findMany({ where: { id: { in: items } } });
      for (const cert of certs) {
        await prisma.user.update({
          where: { id: cert.userId },
          data: { points: { increment: 100 } }
        });
        await prisma.pointsTransaction.create({
          data: {
            userId: cert.userId,
            delta: 100,
            reason: `Certificate Approved: ${cert.name}`,
            createdBy: req.user!.userId
          }
        });
      }
    }

    res.json({ message: "Approvals processed successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to process approvals" });
  }
});

router.get("/students/at-risk", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { points: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        house: true,
        points: true
      }
    });

    const formatted = students.map(s => ({
      id: s.id,
      name: s.name,
      house: s.house,
      points: s.points,
      reason: "Low points accumulation",
      lastActive: "Unknown" // We don't track login dates yet
    }));

    res.json({ students: formatted });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch at-risk students" });
  }
});
// Scoped export endpoint for students
router.get("/export/students", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        email: true,
        name: true,
        house: true,
        points: true,
        githubUsername: true,
        htbUsername: true,
      },
      orderBy: { points: 'desc' }
    });

    const format = req.query.format === 'csv' ? 'csv' : 'json';

    if (format === 'csv') {
      const headers = ['id', 'name', 'email', 'house', 'points', 'github', 'htb'];
      const rows = students.map(s => [
        s.id,
        s.name,
        s.email,
        s.house,
        s.points.toString(),
        s.githubUsername || '',
        s.htbUsername || ''
      ].map(v => `"${v}"`).join(','));
      
      const csv = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
      res.send(csv);
    } else {
      res.json({ students });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to export students" });
  }
});
export default router;
