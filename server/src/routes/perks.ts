import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { prisma } from "../lib/db.js";
import { getOverallKey, getHouseKey } from "../lib/leaderboard.js";
import { redis } from "../lib/redis.js";
import { z } from "zod";

const router = Router();

// 1. List available perks
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.perkItem.findMany({
      where: { isActive: true },
      orderBy: { cost: "asc" }
    });
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to fetch perks" });
  }
});

const RedeemSchema = z.object({
  idempotencyKey: z.string().uuid(),
});

// 2. Redeem a perk
router.post("/:id/redeem", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = req.params.id!;
    const { idempotencyKey } = RedeemSchema.parse(req.body);
    const userId = req.user!.userId;

    // Check idempotency first (fast path)
    const existing = await prisma.redemption.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } }
    });
    if (existing) {
      res.json({ message: "Already redeemed", redemption: existing });
      return;
    }

    const item = await prisma.perkItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) {
      res.status(404).json({ error: "Item not found or inactive" });
      return;
    }

    // Wrap the entire redemption in an interactive transaction with row-level locking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the user row (SELECT ... FOR UPDATE) to serialize balance checks
      const user = await tx.$queryRaw<any[]>`
        SELECT id, points, house FROM "User" 
        WHERE id = ${userId} 
        FOR UPDATE
      `;
      
      if (!user.length) throw new Error("User not found");
      const currentPoints = user[0].points;
      const house = user[0].house;

      if (currentPoints < item.cost) {
        throw new Error("Insufficient points");
      }

      // 2. Check and decrement stock using atomic update constraint
      if (item.quantityRemaining !== null) {
        const updatedItem = await tx.perkItem.updateMany({
          where: { 
            id: itemId, 
            quantityRemaining: { gt: 0 } 
          },
          data: {
            quantityRemaining: { decrement: 1 }
          }
        });
        
        if (updatedItem.count === 0) {
          throw new Error("Item out of stock");
        }
      }

      // 3. Insert the redemption (will throw unique constraint error if idempotencyKey is reused concurrently)
      const redemption = await tx.redemption.create({
        data: {
          userId,
          perkItemId: itemId,
          idempotencyKey
        }
      });

      // 4. Update the user balance and insert ledger row
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: item.cost } }
      });

      await tx.pointsTransaction.create({
        data: {
          userId,
          delta: -item.cost,
          reason: `Redeemed item: ${item.name}`,
          referenceType: "REDEMPTION",
          referenceId: redemption.id
        }
      });

      return { redemption, currentPoints: currentPoints - item.cost, house };
    });

    // 5. Write-through to Redis leaderboard synchronously after transaction commits
    const pipeline = redis.pipeline();
    pipeline.zadd(getOverallKey(), result.currentPoints, userId);
    pipeline.zadd(getHouseKey(result.house), result.currentPoints, userId);
    await pipeline.exec();

    res.json({ message: "Success", redemption: result.redemption });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed";
    if (message === "Insufficient points" || message === "Item out of stock") {
      res.status(400).json({ error: message });
    } else if ((err as any).code === "P2002") {
      // Unique constraint failed (idempotency key)
      res.status(409).json({ error: "Concurrent duplicate request" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

export default router;
