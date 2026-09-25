import { Router, type Router as IRouter, type Request, type Response } from "express";
import { getTopUsers, getOverallKey, getHouseKey } from "../lib/leaderboard.js";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/db.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { z } from "zod";
import type { House } from "@prisma/client";

const router: IRouter = Router();

// Zod schema for house validation
const HouseParamSchema = z.enum(["RED", "BLUE", "GREEN", "PURPLE"]);

router.get("/overall", async (_req: Request, res: Response): Promise<void> => {
  try {
    const top = await getTopUsers();
    res.json({ leaderboard: top });
  } catch {
    res.status(500).json({ error: "Failed to fetch overall leaderboard" });
  }
});

router.get("/house/:house", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawHouse = req.params.house;
    if (typeof rawHouse !== "string") {
      res.status(400).json({ error: "Invalid house parameter" });
      return;
    }
    const house = HouseParamSchema.parse(rawHouse.toUpperCase());
    const top = await getTopUsers(house as House);
    res.json({ house, leaderboard: top });
  } catch {
    res.status(400).json({ error: "Invalid house" });
  }
});

router.get("/hall-of-fame", async (_req: Request, res: Response): Promise<void> => {
  try {
    const topStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { points: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        house: true,
        points: true,
        badges: {
          include: { badge: true }
        }
      }
    });

    const housePoints = await prisma.user.groupBy({
      by: ['house'],
      where: { role: "STUDENT" },
      _sum: { points: true }
    });

    const houseMap = housePoints.reduce((acc, h) => {
      acc[h.house] = h._sum.points || 0;
      return acc;
    }, {} as Record<string, number>);

    const houseStandings = [
      { name: 'Red', points: houseMap.RED || 0 },
      { name: 'Blue', points: houseMap.BLUE || 0 },
      { name: 'Green', points: houseMap.GREEN || 0 },
      { name: 'Purple', points: houseMap.PURPLE || 0 },
    ].sort((a, b) => b.points - a.points);

    res.json({
      topStudents: topStudents.map((s, idx) => ({
        id: s.id,
        name: s.name,
        house: s.house,
        points: s.points,
        rank: idx + 1,
        badges: s.badges.length
      })),
      houseStandings
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch hall of fame" });
  }
});

/**
 * GET /api/leaderboard/house-score
 * Returns the weighted category breakdown and net score for each house.
 */
router.get("/house-score", async (req: Request, res: Response): Promise<void> => {
  try {
    const termName = typeof req.query.term === 'string' ? req.query.term : "Current";

    // 1. Fetch cached weighted points
    const points = await prisma.housePoints.findMany({
      where: { termName }
    });


    // To get house-level discipline, we need to map userId -> house
    // For now, simpler query: aggregate by fetching users
    const records = await prisma.disciplineRecord.findMany({
      where: { termName: termName === "Current" ? null : termName },
      include: { user: { select: { house: true } } }
    });
    
    const penalties = { RED: 0, BLUE: 0, GREEN: 0, PURPLE: 0 };
    for (const r of records) {
      penalties[r.user.house] += r.pointsDeducted;
    }

    const houseStandings = {
      RED: { categories: {}, grossScore: 0, penalties: penalties.RED, netScore: 0 },
      BLUE: { categories: {}, grossScore: 0, penalties: penalties.BLUE, netScore: 0 },
      GREEN: { categories: {}, grossScore: 0, penalties: penalties.GREEN, netScore: 0 },
      PURPLE: { categories: {}, grossScore: 0, penalties: penalties.PURPLE, netScore: 0 }
    };

    for (const p of points) {
      // @ts-ignore
      houseStandings[p.house].categories[p.category] = {
        earned: p.earnedPoints,
        weighted: Math.round(p.weightedScore * 100) / 100
      };
      // @ts-ignore
      houseStandings[p.house].grossScore += Math.round(p.weightedScore * 100) / 100;
    }

    for (const house of ["RED", "BLUE", "GREEN", "PURPLE"]) {
      // @ts-ignore
      houseStandings[house].netScore = houseStandings[house].grossScore - houseStandings[house].penalties;
    }

    res.json({ termName, standings: houseStandings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weighted house scores" });
  }
});

/**
 * GET /api/leaderboard/most-improved
 * Ranks students by the total points they earned in the last 30 days.
 */
router.get("/most-improved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sum all positive point transactions per user over the last 30 days
    const transactions = await prisma.pointsTransaction.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        delta: { gt: 0 }
      },
      _sum: { delta: true },
      orderBy: { _sum: { delta: 'desc' } },
      take: 10
    });

    // Fetch user details for these top improvers
    const userIds = transactions.map(t => t.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, house: true, avatar: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const mostImproved = transactions.map((t, idx) => ({
      rank: idx + 1,
      id: t.userId,
      name: userMap.get(t.userId)?.name || "Unknown",
      house: userMap.get(t.userId)?.house || "UNKNOWN",
      avatar: userMap.get(t.userId)?.avatar,
      pointsGained: t._sum.delta || 0
    }));

    res.json({ leaderboard: mostImproved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch most improved leaderboard" });
  }
});

// Admin ONLY: Panic button to completely rebuild Redis from Postgres
router.post(
  "/admin/rebuild",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        where: { points: { gt: 0 } },
        select: { id: true, points: true, house: true },
      });

      const pipeline = redis.pipeline();

      // Wipe active sorted sets
      pipeline.del(getOverallKey());
      pipeline.del(getHouseKey("RED"));
      pipeline.del(getHouseKey("BLUE"));
      pipeline.del(getHouseKey("GREEN"));
      pipeline.del(getHouseKey("PURPLE"));

      // Bulk insert everything from Postgres
      for (const user of users) {
        pipeline.zadd(getOverallKey(), user.points, user.id);
        pipeline.zadd(getHouseKey(user.house), user.points, user.id);
      }

      await pipeline.exec();

      res.json({ message: "Leaderboard successfully rebuilt from source of truth." });
    } catch {
      res.status(500).json({ error: "Failed to rebuild leaderboard" });
    }
  }
);

// Admin ONLY: End of Term Snapshot & Reset
router.post(
  "/admin/snapshot",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { termName } = req.body;
      if (!termName || typeof termName !== "string") {
        res.status(400).json({ error: "termName is required" });
        return;
      }

      // Fetch all active users
      const users = await prisma.user.findMany({
        where: { points: { gt: 0 } },
        select: { id: true, house: true, points: true },
      });

      if (users.length === 0) {
        res.json({ message: "No active users to snapshot." });
        return;
      }

      // Fetch precise ranks via Redis pipeline
      const pipeline = redis.pipeline();
      for (const user of users) {
        pipeline.zrevrank(getOverallKey(), user.id);
        pipeline.zrevrank(getHouseKey(user.house), user.id);
      }
      const rankResults = await pipeline.exec();
      
      const snapshots = [];
      let rankResultIndex = 0;
      
      for (const user of users) {
        const overallRankRaw = rankResults?.[rankResultIndex]?.[1];
        const houseRankRaw = rankResults?.[rankResultIndex + 1]?.[1];
        
        const rankOverall = typeof overallRankRaw === "number" ? overallRankRaw + 1 : 0;
        const rankInHouse = typeof houseRankRaw === "number" ? houseRankRaw + 1 : 0;

        snapshots.push({
          termName,
          userId: user.id,
          house: user.house,
          points: user.points,
          rankOverall,
          rankInHouse
        });
        
        rankResultIndex += 2;
      }

      // 1. Transaction: Bulk insert snapshots, then wipe points
      await prisma.$transaction([
        prisma.leaderboardSnapshot.createMany({ data: snapshots }),
        prisma.user.updateMany({ where: { role: "STUDENT" }, data: { points: 0 } })
      ]);

      // 2. Wipe active sorted sets in Redis
      const wipePipeline = redis.pipeline();
      wipePipeline.del(getOverallKey());
      wipePipeline.del(getHouseKey("RED"));
      wipePipeline.del(getHouseKey("BLUE"));
      wipePipeline.del(getHouseKey("GREEN"));
      wipePipeline.del(getHouseKey("PURPLE"));
      await wipePipeline.exec();

      res.json({ message: `Term '${termName}' snapshotted and active points zeroed.` });
    } catch {
      res.status(500).json({ error: "Failed to execute term snapshot" });
    }
  }
);

export default router;
