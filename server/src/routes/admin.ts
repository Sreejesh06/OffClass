import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import { logAction } from "../lib/audit.js";
import { transferHouseLeaderboard } from "../lib/leaderboard.js";

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
    const [certs, houseTransfers, achievements] = await Promise.all([
      prisma.certificate.findMany({
        where: { status: "UPLOADED" },
        include: { user: { select: { name: true, house: true } } },
      }),
      prisma.houseTransferRequest.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { name: true, house: true } } },
      }),
      prisma.achievement.findMany({
        where: { status: "PENDING_VERIFICATION" },
        include: { user: { select: { name: true, house: true } } },
      }),
    ]);
    
    // Map to a generic approval item format for the frontend
    const approvals = [
      ...certs.map((c) => ({
        id: c.id,
        type: "CERTIFICATE",
        studentName: c.user.name,
        studentHouse: c.user.house,
        targetHouse: undefined,
        description: `Certificate uploaded: ${c.name}`,
        date: c.createdAt.toISOString(),
      })),
      ...houseTransfers.map((ht) => ({
        id: ht.id,
        type: "HOUSE_TRANSFER",
        studentName: ht.user.name,
        studentHouse: ht.currentHouse,
        targetHouse: ht.targetHouse,
        description: `Transfer Request to ${ht.targetHouse} House: "${ht.reason}"`,
        date: ht.createdAt.toISOString(),
        reason: ht.reason,
      })),
      ...achievements.map((a) => ({
        id: a.id,
        type: "ACHIEVEMENT",
        studentName: a.user.name,
        studentHouse: a.user.house,
        description: `Achievement: ${a.title} (${a.category}) ${a.opportunityId ? '[From Board]' : ''}`,
        date: a.createdAt.toISOString(),
      })),
    ];

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

    const reviewerId = req.user!.userId;
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // 1. Process any Certificate items
    const certs = await prisma.certificate.findMany({ where: { id: { in: items } } });
    if (certs.length > 0) {
      await prisma.certificate.updateMany({
        where: { id: { in: certs.map((c) => c.id) } },
        data: { status: newStatus, reviewedBy: reviewerId },
      });

      if (action === 'approve') {
        for (const cert of certs) {
          await prisma.user.update({
            where: { id: cert.userId },
            data: { points: { increment: 100 } },
          });
          await prisma.pointsTransaction.create({
            data: {
              userId: cert.userId,
              delta: 100,
              reason: `Certificate Approved: ${cert.name}`,
              createdBy: reviewerId,
            },
          });
        }
      }
    }

    // 2. Process any HouseTransferRequest items
    const transferRequests = await prisma.houseTransferRequest.findMany({
      where: { id: { in: items }, status: "PENDING" },
      include: { user: { select: { id: true, points: true } } },
    });

    for (const tr of transferRequests) {
      if (action === 'approve') {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: tr.userId },
            data: { house: tr.targetHouse },
          }),
          prisma.houseTransferRequest.update({
            where: { id: tr.id },
            data: { status: "APPROVED", reviewedBy: reviewerId },
          }),
        ]);

        try {
          await transferHouseLeaderboard(tr.userId, tr.currentHouse, tr.targetHouse, tr.user.points);
        } catch (err) {
          console.error("Redis leaderboard transfer error:", err);
        }

        await logAction(reviewerId, "HOUSE_TRANSFER_APPROVED", "USER", tr.userId, {
          from: tr.currentHouse,
          to: tr.targetHouse,
        });
      } else {
        await prisma.houseTransferRequest.update({
          where: { id: tr.id },
          data: { status: "REJECTED", reviewedBy: reviewerId },
        });

        await logAction(reviewerId, "HOUSE_TRANSFER_REJECTED", "USER", tr.userId, {
          from: tr.currentHouse,
          to: tr.targetHouse,
        });
      }
    }

    // 3. Process any Achievement items
    const achievements = await prisma.achievement.findMany({
      where: { id: { in: items }, status: "PENDING_VERIFICATION" },
    });

    for (const a of achievements) {
      if (action === 'approve') {
        const pointsToAward = a.pointsAwarded || 50; // Default points for batch approve if not specified
        await prisma.$transaction([
          prisma.achievement.update({
            where: { id: a.id },
            data: { status: "APPROVED", reviewedBy: reviewerId, pointsAwarded: pointsToAward },
          }),
          prisma.user.update({
            where: { id: a.userId },
            data: { points: { increment: pointsToAward } },
          }),
          prisma.pointsTransaction.create({
            data: {
              userId: a.userId,
              delta: pointsToAward,
              reason: `Achievement Approved: ${a.title}`,
              createdBy: reviewerId,
              referenceType: "ACHIEVEMENT",
              referenceId: a.id,
            },
          }),
        ]);
        await logAction(reviewerId, "ACHIEVEMENT_APPROVED", "ACHIEVEMENT", a.id, { points: pointsToAward });
      } else {
        await prisma.achievement.update({
          where: { id: a.id },
          data: { status: "REJECTED", reviewedBy: reviewerId },
        });
        await logAction(reviewerId, "ACHIEVEMENT_REJECTED", "ACHIEVEMENT", a.id);
      }
    }

    res.json({ message: "Processed approvals successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to process approvals" });
  }
});

/**
 * POST /api/admin/house-transfers/:id/review
 * Review a single house transfer ticket with optional teacher notes.
 */
router.post("/house-transfers/:id/review", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params["id"] as string;
    const { action, notes } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ error: "Action must be 'approve' or 'reject'" });
      return;
    }

    const transferReq = await prisma.houseTransferRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, points: true, house: true } } },
    });

    if (!transferReq) {
      res.status(404).json({ error: "House transfer request not found" });
      return;
    }

    if (transferReq.status !== "PENDING") {
      res.status(400).json({ error: "This request has already been processed" });
      return;
    }

    const reviewerId = req.user!.userId;

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: transferReq.userId },
          data: { house: transferReq.targetHouse },
        }),
        prisma.houseTransferRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            reviewedBy: reviewerId,
            reviewNotes: notes || null,
          },
        }),
      ]);

      try {
        await transferHouseLeaderboard(
          transferReq.userId,
          transferReq.currentHouse,
          transferReq.targetHouse,
          transferReq.user.points
        );
      } catch (redisErr) {
        console.error("Leaderboard redis update failed on house transfer:", redisErr);
      }

      await logAction(reviewerId, "HOUSE_TRANSFER_APPROVED", "USER", transferReq.userId, {
        from: transferReq.currentHouse,
        to: transferReq.targetHouse,
        notes,
      });
    } else {
      await prisma.houseTransferRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedBy: reviewerId,
          reviewNotes: notes || null,
        },
      });

      await logAction(reviewerId, "HOUSE_TRANSFER_REJECTED", "USER", transferReq.userId, {
        from: transferReq.currentHouse,
        to: transferReq.targetHouse,
        notes,
      });
    }

    res.json({ message: `House transfer request ${action}d successfully` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to process house transfer review" });
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
/**
 * POST /api/admin/achievements/:id/review
 * Approve or reject an achievement submission, optionally awarding points.
 */
router.post("/achievements/:id/review", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, pointsAwarded } = req.body; // action: 'approve' | 'reject'
    const reviewerId = req.user!.userId;

    if (action !== 'approve' && action !== 'reject') {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    if (achievement.status !== 'PENDING_VERIFICATION') {
      res.status(400).json({ error: "Achievement is already reviewed" });
      return;
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const points = action === 'approve' ? (Number(pointsAwarded) || 0) : null;

    await prisma.achievement.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: reviewerId,
        pointsAwarded: points,
      },
    });

    if (action === 'approve' && points && points > 0) {
      await prisma.user.update({
        where: { id: achievement.userId },
        data: { points: { increment: points } },
      });
      await prisma.pointsTransaction.create({
        data: {
          userId: achievement.userId,
          delta: points,
          reason: `Achievement: ${achievement.title}`,
          createdBy: reviewerId,
          referenceType: "ACHIEVEMENT",
          referenceId: achievement.id,
        },
      });
    }

    await logAction(reviewerId, `REVIEW_ACHIEVEMENT_${newStatus}`, "ACHIEVEMENT", id, { points });

    res.json({ message: `Achievement ${newStatus.toLowerCase()}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to review achievement" });
  }
});

export default router;
