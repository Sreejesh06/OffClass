import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import type { PrismaPromise } from "@prisma/client";
import { logAction } from "../lib/audit.js";
import { transferHouseLeaderboard } from "../lib/leaderboard.js";
import { recalculateHouseScores } from "../lib/scoring.js";
import { z } from "zod";

import rateLimit from "express-rate-limit";

const router: IRouter = Router();

// First duplicate route removed.
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
    const certs = await prisma.certificate.findMany({ where: { id: { in: items }, status: "UPLOADED" } });
    if (certs.length > 0) {
      const txOperations: PrismaPromise<any>[] = [];
      
      txOperations.push(prisma.certificate.updateMany({
        where: { id: { in: certs.map((c) => c.id) } },
        data: { status: newStatus, reviewedBy: reviewerId },
      }));

      if (action === 'approve') {
        for (const cert of certs) {
          const points = 10; // Defaulting to 10 for now as per audit
          txOperations.push(prisma.user.update({
            where: { id: cert.userId },
            data: { points: { increment: points } },
          }));
          txOperations.push(prisma.pointsTransaction.create({
            data: {
              userId: cert.userId,
              delta: points,
              reason: `Certificate Approved: ${cert.name}`,
              createdBy: reviewerId,
            },
          }));
        }
      }
      
      await prisma.$transaction(txOperations);
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
      include: { rubric: true }
    });

    for (const a of achievements) {
      if (action === 'approve') {
        // Use rubric points if explicitly linked, otherwise fallback to existing pointsAwarded or legacy default
        const pointsToAward = a.rubric?.points ?? (a.pointsAwarded || 50); 
        
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
              reason: a.rubric ? `Approved: ${a.rubric.description}` : `Achievement Approved: ${a.title}`,
              createdBy: reviewerId,
              referenceType: "ACHIEVEMENT",
              referenceId: a.id,
            },
          }),
        ]);
        await logAction(reviewerId, "ACHIEVEMENT_APPROVED", "ACHIEVEMENT", a.id, { points: pointsToAward, rubricId: a.rubricId });
      } else {
        await prisma.achievement.update({
          where: { id: a.id },
          data: { status: "REJECTED", reviewedBy: reviewerId },
        });
        await logAction(reviewerId, "ACHIEVEMENT_REJECTED", "ACHIEVEMENT", a.id);
      }
    }


    // Trigger async recalculation of the master house score model
    recalculateHouseScores().catch(err => console.error("Async house score recalculation failed:", err));

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

      try {
        await logAction(reviewerId, "HOUSE_TRANSFER_APPROVED", "USER", transferReq.userId, {
          from: transferReq.currentHouse,
          to: transferReq.targetHouse,
          notes,
        });
      } catch (e) { console.error("Audit log failed:", e); }
    } else {
      await prisma.houseTransferRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedBy: reviewerId,
          reviewNotes: notes || null,
        },
      });

      try {
        await logAction(reviewerId, "HOUSE_TRANSFER_REJECTED", "USER", transferReq.userId, {
          from: transferReq.currentHouse,
          to: transferReq.targetHouse,
          notes,
        });
      } catch (e) { console.error("Audit log failed:", e); }
    }

    res.json({ message: `House transfer request ${action}d successfully` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to process house transfer review" });
  }
});

router.get("/students/at-risk", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const students = await prisma.user.findMany({
      where: { 
        role: "STUDENT",
        OR: [
          { lastLoginAt: null },
          { lastLoginAt: { lt: twoWeeksAgo } }
        ]
      },
      orderBy: { lastLoginAt: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        house: true,
        points: true,
        lastLoginAt: true
      }
    });

    const formatted = students.map(s => ({
      id: s.id,
      name: s.name,
      house: s.house,
      points: s.points,
      reason: "Inactive for > 14 days",
      lastActive: s.lastLoginAt ? s.lastLoginAt.toISOString().split('T')[0] : "Never"
    }));

    res.json({ students: formatted });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch at-risk students" });
  }
});
// Scoped export endpoint for students
router.get("/export/students", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const actorId = req.user!.userId;
    const actorRole = req.user!.role;

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        email: true,
        name: true,
        house: true,
        points: true,
        profileLinks: {
          select: {
            provider: true,
            externalHandle: true
          }
        }
      },
      orderBy: { points: 'desc' }
    });

    try {
      await logAction(
        actorId,
        "EXPORT_USERS",
        "SYSTEM",
        "ALL_STUDENTS",
        { resultCount: students.length, role: actorRole }
      );
    } catch (e) {
      console.error("Audit log failed:", e);
    }

    const format = req.query.format === 'csv' ? 'csv' : 'json';

    if (format === 'csv') {
      const headers = ['id', 'name', 'email', 'house', 'points', 'github', 'htb'];
      const rows = students.map(s => {
        const github = s.profileLinks.find(l => l.provider === "GITHUB")?.externalHandle || '';
        const htb = s.profileLinks.find(l => l.provider === "HTB")?.externalHandle || '';
        
        return [
          s.id,
          s.name,
          s.email,
          s.house,
          s.points.toString(),
          github,
          htb
        ].map(v => `"${v}"`).join(',');
      });
      
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

    const achievement = await prisma.achievement.findUnique({ 
      where: { id },
      include: { rubric: true }
    });
    if (!achievement) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    if (achievement.status !== 'PENDING_VERIFICATION') {
      res.status(400).json({ error: "Achievement is already reviewed" });
      return;
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    
    // Strict enforcement: if rubric is attached, it overrides any manual points requested.
    let points = action === 'approve' ? (Number(pointsAwarded) || 0) : null;
    if (action === 'approve' && achievement.rubric) {
      points = achievement.rubric.points;
    }

    if (action === 'approve' && points !== null) {
      await prisma.$transaction([
        prisma.achievement.update({
          where: { id },
          data: {
            status: newStatus,
            reviewedBy: reviewerId,
            pointsAwarded: points,
          },
        }),
        prisma.user.update({
          where: { id: achievement.userId },
          data: { points: { increment: points } },
        }),
        prisma.pointsTransaction.create({
          data: {
            userId: achievement.userId,
            delta: points,
            reason: achievement.rubric ? `Approved: ${achievement.rubric.description}` : `Achievement: ${achievement.title}`,
            createdBy: reviewerId,
            referenceType: "ACHIEVEMENT",
            referenceId: achievement.id,
          },
        })
      ]);
    } else {
      await prisma.achievement.update({
        where: { id },
        data: {
          status: newStatus,
          reviewedBy: reviewerId,
          pointsAwarded: points,
        },
      });
    }

    try {
      await logAction(reviewerId, `REVIEW_ACHIEVEMENT_${newStatus}`, "ACHIEVEMENT", id, { points, rubricId: achievement.rubricId });
    } catch (e) { console.error("Audit log failed:", e); }

    if (newStatus === 'APPROVED') {
      recalculateHouseScores().catch(err => console.error("Async house score recalculation failed:", err));
    }

    res.json({ message: `Achievement ${newStatus.toLowerCase()}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to review achievement" });
  }
});

/**
 * GET /api/admin/discipline
 * Fetch all discipline records
 */
router.get("/discipline", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await prisma.disciplineRecord.findMany({
      include: {
        user: { select: { name: true, house: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch discipline records" });
  }
});

/**
 * POST /api/admin/discipline
 * Record a new disciplinary violation against a student
 */
router.post("/discipline", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const DisciplineSchema = z.object({
      userId: z.string().uuid(),
      violation: z.string().min(5).max(500).trim(),
      pointsDeducted: z.number().int().min(1).max(100),
      evidence: z.string().url().optional().nullable().or(z.literal("")),
      termName: z.string().max(50).optional().nullable(),
    });

    const parsed = DisciplineSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid discipline payload" });
      return;
    }

    const { userId, violation, pointsDeducted, evidence, termName } = parsed.data;
    const reviewerId = req.user!.userId;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.role !== "STUDENT") {
      res.status(404).json({ error: "Target student not found" });
      return;
    }

    const record = await prisma.disciplineRecord.create({
      data: {
        userId,
        violation,
        pointsDeducted,
        evidence: evidence || null,
        termName: termName || null,
        reportedBy: reviewerId,
      }
    });

    // NOTE: Framework dictates discipline reduces the HOUSE score, NOT the individual student's points.
    // The HousePoints engine will calculate this. We don't deduct from user.points directly.

    await logAction(reviewerId, "DISCIPLINE_RECORDED", "USER", userId, { violation, pointsDeducted });

    recalculateHouseScores(termName || "Current").catch(err => console.error("Async house score recalculation failed:", err));

    res.status(201).json({ message: "Discipline record created", record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to record discipline" });
  }
});

/**
 * GET /api/admin/rubric
 * Fetch the entire points rubric, including inactive items
 */
router.get("/rubric", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const rubric = await prisma.pointsRubric.findMany({
      orderBy: [
        { category: 'asc' },
        { points: 'desc' }
      ]
    });
    res.json({ rubric });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rubric" });
  }
});

/**
 * PATCH /api/admin/rubric/:id
 * Update point values, limits, or toggle active status for a scoring rule
 */
router.patch("/rubric/:id", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const RubricPatchSchema = z.object({
      points: z.number().int().min(0).max(100).optional(),
      capPerTerm: z.number().int().min(1).max(1000).nullable().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = RubricPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid rubric update payload" });
      return;
    }

    const { points, capPerTerm, isActive } = parsed.data;
    const reviewerId = req.user!.userId;

    const dataToUpdate: any = {};
    if (points !== undefined) dataToUpdate.points = points;
    if (capPerTerm !== undefined) dataToUpdate.capPerTerm = capPerTerm;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    if (Object.keys(dataToUpdate).length === 0) {
      res.status(400).json({ error: "No valid fields provided for update" });
      return;
    }

    const updated = await prisma.pointsRubric.update({
      where: { id },
      data: dataToUpdate
    });

    await logAction(reviewerId, "UPDATED_RUBRIC", "SYSTEM", id, dataToUpdate);

    // If point values changed, we technically should NOT backpropagate them to old achievements. 
    // Old achievements keep the points they were awarded at the time.

    res.json({ message: "Rubric updated", rubric: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update rubric" });
  }
});


const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: "Too many search requests, please try again later." }
});

/**
 * GET /api/admin/users/search
 * Fast search for students by name or email, useful for discipline logging
 */
router.get("/users/search", requireAuth, requireRole(["ADMIN", "TEACHER"]), searchLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      res.json({ users: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, house: true, email: true },
      take: 10
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
