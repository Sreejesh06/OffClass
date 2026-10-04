import { Router, Request, Response } from "express";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Get all notifications for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: (req as any).user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark all as read
router.put("/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: (req as any).user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Delete one
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.delete({
      where: { 
        id: req.params.id,
        userId: (req as any).user.id // ensure ownership
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// Delete all
router.delete("/", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: (req as any).user.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

export default router;
