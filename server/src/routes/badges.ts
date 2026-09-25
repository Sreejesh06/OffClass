import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/db.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router = Router();

// GET /api/badges/user/:id (or 'me')
router.get("/user/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" }
    });
    res.json(userBadges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

// GET /api/badges - list all available badges
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const badges = await prisma.badge.findMany({ orderBy: { name: "asc" } });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

// POST /api/badges - Create a new badge (Admin only)
const CreateBadgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

router.post("/", requireAuth, requireRole(["ADMIN"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const data = CreateBadgeSchema.parse(req.body);
    const badge = await prisma.badge.create({ data: { ...data, imageUrl: data.imageUrl ?? null } });
    res.json({ success: true, badge });
  } catch (error) {
    res.status(400).json({ error: "Invalid data or badge already exists" });
  }
});

// POST /api/badges/award - Award a badge to a user (Admin/Teacher only)
const AwardBadgeSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
});

router.post("/award", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, badgeId } = AwardBadgeSchema.parse(req.body);
    
    // UPSERT ensures we don't throw an error if they already have it
    const userBadge = await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      update: {}, // Do nothing if it exists
      create: {
        userId,
        badgeId,
        awardedBy: req.user!.userId
      },
      include: { badge: true }
    });

    res.json({ success: true, userBadge });
  } catch (error) {
    res.status(400).json({ error: "Failed to award badge" });
  }
});

export default router;
