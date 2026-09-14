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
          select: { id: true, name: true, createdAt: true, mimeType: true, fileKey: true, order: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
        achievements: {
          where: { status: "APPROVED" },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Build activity heatmap by combining calendars from all synced platforms
    const profileSyncs = await prisma.profileSync.findMany({
      where: { userId: id, status: "SYNCED" }
    });

    const heatmapMap: Record<string, { points: number; texts: string[]; details: Record<string, number> }> = {};
    for (const sync of profileSyncs) {
      const stats = sync.parsedStats as any;
      if (stats?.calendar && typeof stats.calendar === 'object') {
        const providerName = sync.provider === 'GITHUB' ? 'GitHub Commits' 
                           : sync.provider === 'LEETCODE' ? 'LeetCode Submissions' 
                           : sync.provider === 'CODEFORCES' ? 'Codeforces Submissions' 
                           : sync.provider === 'GFG' ? 'GFG Problems' 
                           : 'Activities';

        for (const [dateStr, count] of Object.entries(stats.calendar)) {
          if (!heatmapMap[dateStr]) heatmapMap[dateStr] = { points: 0, texts: [], details: {} };
          heatmapMap[dateStr].points += Number(count);
          heatmapMap[dateStr].texts.push(`${count} ${providerName}`);
          heatmapMap[dateStr].details[sync.provider] = Number(count);
        }
      }
    }
    const heatmap = Object.entries(heatmapMap).map(([date, data]) => ({ 
      date, 
      points: data.points,
      summary: data.texts.join(' | '),
      details: data.details
    }));

    const rank = await prisma.user.count({
      where: { points: { gt: user.points }, role: "STUDENT" },
    });

    const latestSnapshot = user.leaderboardSnapshots[0];

    const activePlatforms = profileSyncs.map(s => s.provider);

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
      achievements: user.achievements,
      heatmap,
      activePlatforms,
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

/**
 * GET /api/users/me/house-transfer
 * Authenticated — check current user's latest house transfer request status.
 */
router.get("/me/house-transfer", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, house: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const latestRequest = await prisma.houseTransferRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      currentHouse: user.house,
      request: latestRequest,
      hasPending: latestRequest?.status === "PENDING",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch house transfer status" });
  }
});

/**
 * POST /api/users/me/house-transfer
 * Authenticated — submit a ticket requesting teacher approval to transfer house.
 */
const HouseTransferSchema = z.object({
  targetHouse: z.enum(["RED", "BLUE", "GREEN", "PURPLE"]),
  reason: z
    .string()
    .min(10, "Please provide a reason of at least 10 characters")
    .max(500, "Reason must be 500 characters or fewer"),
});

router.post("/me/house-transfer", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { targetHouse, reason } = HouseTransferSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, house: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.house === targetHouse) {
      res.status(400).json({ error: "You are already a member of this house" });
      return;
    }

    const existingPending = await prisma.houseTransferRequest.findFirst({
      where: { userId, status: "PENDING" },
    });

    if (existingPending) {
      res.status(400).json({
        error: "You already have a pending house transfer request awaiting teacher review",
      });
      return;
    }

    const request = await prisma.houseTransferRequest.create({
      data: {
        userId,
        currentHouse: user.house,
        targetHouse,
        reason,
      },
    });

    res.status(201).json({
      message: "House transfer request submitted for teacher approval",
      request,
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      res.status(400).json({ error: e.errors[0]?.message || "Invalid input" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to submit house transfer request" });
  }
});

/**
 * POST /api/users/me/achievements
 * Submit a new achievement request for admin approval
 */
router.post("/me/achievements", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, category, position, date, semester, prize, description } = req.body;

    if (!title || !category || !position || !date) {
      res.status(400).json({ error: "Title, category, position, and date are required" });
      return;
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        title,
        category,
        position,
        date: new Date(date),
        semester: semester || null,
        prize: prize || null,
        description: description || null,
      },
    });

    res.status(201).json({
      message: "Achievement submitted for review",
      achievement,
    });
  } catch (error) {
    console.error("Failed to submit achievement:", error);
    res.status(500).json({ error: "Failed to submit achievement" });
  }
});

export default router;
