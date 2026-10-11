import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import { logAction } from "../lib/audit.js";
import { awardPoints, transferHouseLeaderboard, getOverallKey, getHouseKey } from "../lib/leaderboard.js";
import { redis } from "../lib/redis.js";
import { recalculateHouseScores } from "../lib/scoring.js";

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
    const certs = await prisma.certificate.findMany({ 
        where: { id: { in: items } },
        include: { user: { select: { walletAddress: true } } }
    });
    if (certs.length > 0) {
      await prisma.certificate.updateMany({
        where: { id: { in: certs.map((c) => c.id) } },
        data: { status: action === "approve" ? "APPROVED" : "REJECTED" }
      });
      
      if (action === 'approve') {
        const { anchorCertificateHash } = await import('../lib/blockchain.js');
        const crypto = await import('crypto');
        
        for (const cert of certs) {
          // Get the user's house for correct Redis leaderboard update
          const certUser = await prisma.user.findUnique({ 
            where: { id: cert.userId }, 
            select: { house: true, walletAddress: true }
          });
          if (!certUser) continue;

          // Use awardPoints() — atomically updates Postgres AND Redis sorted sets
          await awardPoints(
            cert.userId,
            certUser.house,
            100,
            `Certificate Approved: ${cert.name}`,
            "CERTIFICATE",
            cert.id,
            reviewerId
          );
          
          if (certUser.walletAddress) {
            try {
              const hash = crypto.createHash('sha256').update(cert.fileKey).digest('hex');
              const txHash = await anchorCertificateHash(hash, certUser.walletAddress);
              if (txHash) {
                await prisma.certificate.update({
                  where: { id: cert.id },
                  data: { blockchainTxHash: txHash, isAnchored: true }
                });
              }
            } catch(e) {
              console.error("Failed to anchor cert:", e);
            }
          }
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
        
        // Get user's house for Redis update
        const aUser = await prisma.user.findUnique({ where: { id: a.userId }, select: { house: true } });
        if (!aUser) continue;

        await prisma.achievement.update({
          where: { id: a.id },
          data: { status: "APPROVED", reviewedBy: reviewerId, pointsAwarded: pointsToAward },
        });

        // Use awardPoints() — atomically updates Postgres AND Redis sorted sets
        await awardPoints(
          a.userId,
          aUser.house,
          pointsToAward,
          `Achievement Approved: ${a.title}`,
          "ACHIEVEMENT",
          a.id,
          reviewerId
        );

        await logAction(reviewerId, "ACHIEVEMENT_APPROVED", "ACHIEVEMENT", a.id, { points: pointsToAward });
        prisma.notification.create({ data: { userId: a.userId, title: "Achievement Approved", message: `Your achievement "${a.title}" was approved! You earned ${pointsToAward} points.` } }).catch(e => console.error("Notification failed:", e));
      } else {
        await prisma.achievement.update({
          where: { id: a.id },
          data: { status: "REJECTED", reviewedBy: reviewerId },
        });
        await logAction(reviewerId, "ACHIEVEMENT_REJECTED", "ACHIEVEMENT", a.id);
        prisma.notification.create({ data: { userId: a.userId, title: "Achievement Rejected", message: `Your achievement "${a.title}" was rejected.` } }).catch(e => console.error("Notification failed:", e));
      }
    }

    if (action === "approve") {
      setImmediate(() => recalculateHouseScores().catch((err) => console.error("Recalculate house scores error:", err)));
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

    if (action === "approve") {
      setImmediate(() => recalculateHouseScores().catch((err) => console.error("Recalculate error:", err)));
    }

    res.json({ message: `House transfer request ${action}d successfully` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to process house transfer review" });
  }
});

router.get("/students/at-risk", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    // At-risk = students who have not logged in for 21+ days (inactivity signal)
    const cutoffDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

    const students = await prisma.user.findMany({
      where: { 
        role: "STUDENT",
        OR: [
          { lastLoginAt: { lt: cutoffDate } },
          { lastLoginAt: null }  // Never logged in after account creation
        ]
      },
      orderBy: { lastLoginAt: "asc" }, // Longest-inactive first
      take: 50,
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
      reason: s.lastLoginAt 
        ? `No activity for ${Math.floor((Date.now() - s.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))} days`
        : "Never logged in",
      lastActive: s.lastLoginAt?.toISOString() ?? null
    }));

    res.json({ students: formatted });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch at-risk students" });
  }
});
// NOTE: The canonical /export/students route is defined above (line ~10).
// That version correctly uses profileLinks to surface github/htb handles.
// The duplicate that referenced non-existent User columns has been removed.
/**
 * POST /api/admin/achievements/:id/review
 * Approve or reject an achievement submission, optionally awarding points.
 */
router.post("/achievements/:id/review", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
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

    const user = await prisma.user.findUnique({ where: { id: achievement.userId }, select: { walletAddress: true } });

    await prisma.achievement.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: reviewerId,
        pointsAwarded: points,
      },
    });

    if (action === 'approve' && points && points > 0) {
      // Get user's house — needed for the Redis leaderboard update inside awardPoints()
      const aUser = await prisma.user.findUnique({ where: { id: achievement.userId }, select: { house: true, walletAddress: true } });

      // Use awardPoints() — atomically updates Postgres AND Redis sorted sets (fixes stale leaderboard bug)
      await awardPoints(
        achievement.userId,
        aUser!.house,
        points,
        `Achievement: ${achievement.title}`,
        "ACHIEVEMENT",
        achievement.id,
        reviewerId
      );
      
      // Blockchain Minting
      if (aUser?.walletAddress) {
          try {
              const { mintAchievementSBT } = await import('../lib/blockchain.js');
              const categoryToId: Record<string, number> = { HACKATHON: 1, CTF: 2, COMPETITION: 3, PUBLICATION: 4, OTHER: 5 };
              const sbtId = categoryToId[achievement.category] || 5;
              const txHash = await mintAchievementSBT(aUser.walletAddress, sbtId);
              if (txHash) {
                  await prisma.achievement.update({
                      where: { id },
                      data: { blockchainTxHash: txHash, isAnchored: true }
                  });
              }
          } catch (e) {
              console.error("Failed to mint SBT:", e);
              // Do not fail the API call if blockchain fails
          }
      }
    }

    await logAction(reviewerId, `REVIEW_ACHIEVEMENT_${newStatus}`, "ACHIEVEMENT", id, { points });
    await prisma.notification.create({ data: { userId: achievement.userId, title: newStatus === "APPROVED" ? "Achievement Approved" : "Achievement Rejected", message: newStatus === "APPROVED" ? `Your achievement "${achievement.title}" was approved! You earned ${points} points.` : `Your achievement "${achievement.title}" was rejected.` } });

    res.json({ message: `Achievement ${newStatus.toLowerCase()}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to review achievement" });
  }
});


/**
 * GET /api/admin/redemptions
 * Get pending redemptions
 */
router.get("/redemptions", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const redemptions = await prisma.redemption.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, house: true, email: true } },
        perkItem: { select: { name: true, cost: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json({ redemptions });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch redemptions" });
  }
});

/**
 * PATCH /api/admin/redemptions/:id
 * Fulfill or reject a redemption
 */
router.patch("/redemptions/:id", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const { action } = req.body; // 'fulfill' or 'reject'
    if (action !== 'fulfill' && action !== 'reject') {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: req.params.id as string },
      include: { perkItem: true, user: { select: { house: true } } }
    });

    if (!redemption || redemption.status !== "PENDING") {
      res.status(404).json({ error: "Redemption not found or already processed" });
      return;
    }

    if (action === 'fulfill') {
      await prisma.redemption.update({
        where: { id: redemption.id },
        data: { status: "FULFILLED", fulfilledAt: new Date() }
      });
      await logAction(req.user!.userId, "REDEMPTION_FULFILLED", "REDEMPTION", redemption.id);
      prisma.notification.create({ data: { userId: redemption.userId, title: "Redemption Fulfilled", message: `Your redemption for "${redemption.perkItem.name}" has been fulfilled!` } }).catch(() => {});
    } else {
      // Reject and refund
      await prisma.redemption.update({
        where: { id: redemption.id },
        data: { status: "REJECTED" }
      });
      await awardPoints(
        redemption.userId,
        (redemption.user as any).house,
        (redemption as any).perkItem.cost,
        `Refund: ${(redemption as any).perkItem.name} rejected`,
        "REDEMPTION",
        redemption.id,
        req.user!.userId
      );
      await logAction(req.user!.userId, "REDEMPTION_REJECTED", "REDEMPTION", redemption.id);
      prisma.notification.create({ data: { userId: redemption.userId, title: "Redemption Rejected", message: `Your redemption for "${redemption.perkItem.name}" was rejected. Your points have been refunded.` } }).catch(() => {});
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to process redemption" });
  }
});

// GET /api/admin/users/search?q=... — Fast student lookup for discipline & admin actions
router.get("/users/search", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2) {
      res.json({ users: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        house: true,
        points: true
      }
    });

    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: "Failed to search students" });
  }
});

// GET /api/admin/discipline — View discipline penalty records
router.get("/discipline", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const records = await prisma.disciplineRecord.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: { select: { name: true, house: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    res.json({ records });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch discipline records" });
  }
});

// POST /api/admin/discipline — Log student infraction and dock points
router.post("/discipline", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, violation, pointsDeducted, evidence, termName } = req.body;
    if (!userId || !violation || typeof pointsDeducted !== "number" || pointsDeducted <= 0) {
      res.status(400).json({ error: "Invalid discipline payload: userId, violation, and positive pointsDeducted required." });
      return;
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, house: true }
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const reviewerId = req.user!.userId;
    const penaltyPoints = Math.abs(pointsDeducted);

    const record = await prisma.disciplineRecord.create({
      data: {
        userId,
        violation: violation.trim(),
        pointsDeducted: penaltyPoints,
        evidence: evidence ? evidence.trim() : null,
        reportedBy: reviewerId,
        termName: termName || null
      }
    });

    // Deduct points from Postgres AND Redis sorted sets atomically
    await awardPoints(
      student.id,
      student.house,
      -penaltyPoints,
      `Discipline: ${violation.trim()}`,
      "DISCIPLINE",
      record.id,
      reviewerId
    );

    await logAction(reviewerId, "DISCIPLINE_RECORDED", "USER", student.id, {
      recordId: record.id,
      pointsDeducted: penaltyPoints,
      violation
    });

    // Notify student (fire-and-forget)
    prisma.notification.create({
      data: {
        userId: student.id,
        title: "Disciplinary Penalty",
        message: `${penaltyPoints} points deducted: ${violation.trim()}`
      }
    }).catch(e => console.error("Discipline notification error:", e));

    // Recalculate house scores asynchronously
    setImmediate(() => recalculateHouseScores(termName || "Current").catch(console.error));

    res.json({ success: true, record });
  } catch (e) {
    res.status(500).json({ error: "Failed to record discipline" });
  }
});

// POST /api/admin/term/reset — Snapshot previous rankings, reset points to 0, clear Redis
router.post("/term/reset", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const termName = typeof req.body.termName === "string" && req.body.termName.trim()
      ? req.body.termName.trim()
      : `Term ${new Date().toISOString().slice(0, 10)}`;

    const adminId = req.user!.userId;

    // 1. Fetch all students ordered by points desc
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, house: true, points: true },
      orderBy: { points: "desc" }
    });

    // 2. Snapshot current ranks per house and overall
    const houseRankCounters: Record<string, number> = { RED: 1, BLUE: 1, GREEN: 1, PURPLE: 1 };
    const snapshots = students.map((s, idx) => ({
      termName,
      userId: s.id,
      house: s.house,
      points: s.points,
      rankOverall: idx + 1,
      rankInHouse: houseRankCounters[s.house] ? houseRankCounters[s.house]++ : 1,
      snapshotDate: new Date(),
    }));

    if (snapshots.length > 0) {
      await prisma.leaderboardSnapshot.createMany({
        data: snapshots
      });
    }

    // 3. Reset all student points in Postgres
    await prisma.user.updateMany({
      where: { role: "STUDENT" },
      data: { points: 0 }
    });

    // 4. Clear Redis leaderboard sorted sets
    const pipeline = redis.pipeline();
    pipeline.del(getOverallKey());
    pipeline.del(getHouseKey("RED"));
    pipeline.del(getHouseKey("BLUE"));
    pipeline.del(getHouseKey("GREEN"));
    pipeline.del(getHouseKey("PURPLE"));
    await pipeline.exec();

    // 5. Audit log forensic trail
    await logAction(adminId, "TERM_RESET", "SYSTEM", termName, {
      affectedStudents: students.length
    });

    // 6. Recalculate house scores for new term
    setImmediate(() => recalculateHouseScores(termName).catch(console.error));

    res.json({
      success: true,
      termName,
      affectedStudents: students.length
    });
  } catch (e) {
    console.error("Term reset error:", e);
    res.status(500).json({ error: "Failed to reset term" });
  }
});

// GET /api/admin/rubric — Get points rubric items
router.get("/rubric", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const rubric = await prisma.pointsRubric.findMany({
      orderBy: [{ category: "asc" }, { activityKey: "asc" }]
    });
    res.json({ rubric });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch points rubric" });
  }
});

// PATCH /api/admin/rubric/:id — Update points rubric item
router.patch("/rubric/:id", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { points, capPerTerm, isActive } = req.body;

    const updated = await prisma.pointsRubric.update({
      where: { id },
      data: {
        points: typeof points === "number" ? points : undefined,
        capPerTerm: capPerTerm === null || typeof capPerTerm === "number" ? capPerTerm : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined
      }
    });

    await logAction(req.user!.userId, "RUBRIC_UPDATED", "RUBRIC", id, { points, capPerTerm, isActive });
    res.json({ rubric: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to update points rubric" });
  }
});

export default router;
