import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateToken = (userId: string, role: string = "STUDENT") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "super_secret_fallback_key", {
    expiresIn: "15m",
  });
};

describe("Redemptions Concurrency", () => {
  it("should prevent double-spending when 2 concurrent requests hit a limited stock item", async () => {
    // 1. Setup User with 500 points
    const user = await prisma.user.create({
      data: {
        email: "test_redeem@example.com",
        passwordHash: "hash",
        name: "Test User",
        house: "RED",
        points: 500,
      },
    });

    // 2. Setup Item with Cost 200, Stock 1
    const item = await prisma.perkItem.create({
      data: {
        name: "Limited Edition Badge",
        cost: 200,
        quantityRemaining: 1, // Only 1 in stock!
      },
    });

    const token = generateToken(user.id);
    const idempotencyKey1 = crypto.randomUUID();
    const idempotencyKey2 = crypto.randomUUID(); // different keys to simulate user clicking twice quickly or trying to bypass

    // 3. Fire concurrent requests
    const req1 = request(app)
      .post(`/api/perks/${item.id}/redeem`)
      .set("Cookie", `access_token=${token}`)
      .send({ idempotencyKey: idempotencyKey1 });

    const req2 = request(app)
      .post(`/api/perks/${item.id}/redeem`)
      .set("Cookie", `access_token=${token}`)
      .send({ idempotencyKey: idempotencyKey2 });

    const [res1, res2] = await Promise.all([req1, req2]);

    // 4. Assert only one succeeded
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 400]); // One success, one fails due to 'Item out of stock'

    const errorRes = res1.status === 400 ? res1 : res2;
    expect(errorRes.body.error).toBe("Item out of stock");

    // 5. Verify DB state is exact
    const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(finalUser?.points).toBe(300); // Only deducted once!

    const finalItem = await prisma.perkItem.findUnique({ where: { id: item.id } });
    expect(finalItem?.quantityRemaining).toBe(0); // Never goes below 0

    const redemptions = await prisma.redemption.findMany({ where: { userId: user.id } });
    expect(redemptions.length).toBe(1);

    const txs = await prisma.pointsTransaction.findMany({ where: { userId: user.id } });
    expect(txs.length).toBe(1);
    expect(txs[0].delta).toBe(-200);
  });
});
