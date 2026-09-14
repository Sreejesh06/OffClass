import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import { logAction } from "../lib/audit.js";
import { CreateOpportunitySchema, UpdateOpportunitySchema, ToggleBookmarkSchema } from "shared";
import { House, Role } from "@prisma/client";

const router = Router();

// GET /api/opportunities - List opportunities
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;
    const { type, house } = req.query;

    const whereClause: any = { isActive: true };

    if (house && house !== "ALL") {
      whereClause.targetHouses = { has: house as string };
    }

    if (type) {
      whereClause.type = type as string;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { bookmarks: { where: { lookingForTeammate: true } } }
        },
        postedBy: {
          select: { name: true, avatar: true, house: true, role: true }
        }
      },
      orderBy: [
        { deadline: "asc" },
        { createdAt: "desc" }
      ]
    });

    res.json({ opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// GET /api/opportunities/my-bookmarks - Get user's bookmarked opportunities
router.get("/my-bookmarks", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    const bookmarks = await prisma.opportunityBookmark.findMany({
      where: { userId },
      include: {
        opportunity: {
          include: {
            _count: { select: { bookmarks: { where: { lookingForTeammate: true } } } },
            postedBy: {
              select: { name: true, avatar: true, house: true, role: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ bookmarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// POST /api/opportunities - Create opportunity (TEACHER/ADMIN)
router.post("/", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = CreateOpportunitySchema.parse(req.body);
    const userId = req.user!.userId;

    const opportunity = await prisma.opportunity.create({
      data: {
        ...payload,
        postedById: userId,
      }
    });

    await logAction(userId, "CREATE_OPPORTUNITY", "OPPORTUNITY", opportunity.id);

    res.status(201).json({ opportunity });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid payload or failed to create" });
  }
});

// PATCH /api/opportunities/:id - Update opportunity
router.patch("/:id", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = UpdateOpportunitySchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    if (existing.postedById !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: You do not own this opportunity" });
      return;
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: payload
    });

    await logAction(userId, "UPDATE_OPPORTUNITY", "OPPORTUNITY", id);

    res.json({ opportunity });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update opportunity" });
  }
});

// DELETE /api/opportunities/:id - Soft delete
router.delete("/:id", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    if (existing.postedById !== userId && userRole !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: You do not own this opportunity" });
      return;
    }

    await prisma.opportunity.update({
      where: { id },
      data: { isActive: false }
    });

    await logAction(userId, "DELETE_OPPORTUNITY", "OPPORTUNITY", id);

    res.json({ message: "Opportunity deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

// POST /api/opportunities/:id/bookmark - Toggle bookmark
router.post("/:id/bookmark", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const payload = ToggleBookmarkSchema.parse(req.body);

    const existing = await prisma.opportunityBookmark.findUnique({
      where: { userId_opportunityId: { userId, opportunityId: id } }
    });

    if (existing) {
      if (payload.lookingForTeammate !== undefined && payload.lookingForTeammate !== existing.lookingForTeammate) {
        // Just update the teammate flag
        const updated = await prisma.opportunityBookmark.update({
          where: { id: existing.id },
          data: { lookingForTeammate: payload.lookingForTeammate }
        });
        res.json({ bookmarked: true, lookingForTeammate: updated.lookingForTeammate });
      } else {
        // Toggle off
        await prisma.opportunityBookmark.delete({ where: { id: existing.id } });
        res.json({ bookmarked: false, lookingForTeammate: false });
      }
    } else {
      // Toggle on
      const created = await prisma.opportunityBookmark.create({
        data: {
          userId,
          opportunityId: id,
          lookingForTeammate: payload.lookingForTeammate ?? false
        }
      });
      res.json({ bookmarked: true, lookingForTeammate: created.lookingForTeammate });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// GET /api/opportunities/:id/interested - Get interested students
router.get("/:id/interested", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;

    let whereClause: any = { opportunityId: id };

    // If student, only show those looking for teammates
    if (userRole === "STUDENT") {
      whereClause.lookingForTeammate = true;
    }

    const bookmarks = await prisma.opportunityBookmark.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, house: true, avatar: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ interested: bookmarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch interested students" });
  }
});

export default router;
