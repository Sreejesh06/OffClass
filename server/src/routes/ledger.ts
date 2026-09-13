import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";

const router = Router();

router.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.pointsTransaction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ledger" });
  }
});

export default router;
