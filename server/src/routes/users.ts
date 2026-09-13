import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router = Router();

/**
 * GET /api/users/:id/profile
 * Public — no auth required. Used for shareable profile URLs.
 * Returns everything needed to render the portfolio card.
 */
router.get("/:id/profile", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params["id"] as string;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profileLinks: {
          select: { provider: true, externalHandle: true, verified: true },
        },
        profileSyncs: {
          select: { provider: true, parsedStats: true, lastSyncedAt: true, status: true },
        },
        certificates: {
          where: { status: "APPROVED" },
          select: { id: true, name: true, createdAt: true, mimeType: true },
          orderBy: { createdAt: "desc" },
        },
        pointsTransactions: {
          select: { delta: true, reason: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        badges: {
          include: {
            badge: {
              select: { id: true, name: true, description: true, imageUrl: true },
            },
          },
          orderBy: { awardedAt: "desc" },
        },
        leaderboardSnapshots: {
          orderBy: { snapshotDate: "desc" },
          take: 1,
          select: { rankOverall: true, rankInHouse: true, termName: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Build activity heatmap: group transactions by day for last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const allTransactions = await prisma.pointsTransaction.findMany({
      where: {
        userId: id,
        createdAt: { gte: oneYearAgo },
        delta: { gt: 0 },
      },
      select: { createdAt: true, delta: true },
    });

    const heatmapMap: Record<string, number> = {};
    for (const tx of allTransactions) {
      const day = tx.createdAt.toISOString().split("T")[0]!;
      heatmapMap[day] = (heatmapMap[day] || 0) + tx.delta;
    }
    const heatmap = Object.entries(heatmapMap).map(([date, points]) => ({ date, points }));

    const rank = await prisma.user.count({
      where: { points: { gt: user.points }, role: "STUDENT" },
    });

    const latestSnapshot = user.leaderboardSnapshots[0];

    res.json({
      id: user.id,
      name: user.name,
      house: user.house,
      points: user.points,
      bio: user.bio,
      memberSince: user.createdAt,
      rankOverall: rank + 1,
      rankInHouse: latestSnapshot?.rankInHouse ?? null,
      termName: latestSnapshot?.termName ?? null,
      profileLinks: user.profileLinks,
      syncs: user.profileSyncs,
      certificates: user.certificates,
      recentTransactions: user.pointsTransactions,
      badges: user.badges.map((ub) => ub.badge),
      heatmap,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

/**
 * PATCH /api/users/me/bio
 * Authenticated — update the current user's bio.
 */
const BioSchema = z.object({
  bio: z.string().max(400, "Bio must be 400 characters or fewer"),
});

router.patch("/me/bio", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { bio } = BioSchema.parse(req.body);

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { bio },
    });

    res.json({ message: "Bio updated" });
  } catch (e: any) {
    if (e.name === "ZodError") {
      res.status(400).json({ error: e.errors[0]?.message });
      return;
    }
    res.status(500).json({ error: "Failed to update bio" });
  }
});

export default router;
