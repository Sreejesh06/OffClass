import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";
import crypto from "crypto";

describe("Anonymous Complaints", () => {
  it("should create a complaint with no foreign key back to a user", async () => {
    
    // 1. Get challenge
    const challengeRes = await request(app).get("/api/complaints/challenge");
    expect(challengeRes.status).toBe(200);
    const { seed, difficulty } = challengeRes.body;

    // 2. Solve POW
    let nonce = 0;
    const prefix = "0".repeat(difficulty);
    while (true) {
      const hash = crypto.createHash("sha256").update(seed + nonce.toString()).digest("hex");
      if (hash.startsWith(prefix)) break;
      nonce++;
    }

    // 3. Submit
    const res = await request(app)
      .post("/api/complaints/submit")
      .send({
        seed,
        nonce: nonce.toString(),
        category: "GRADING",
        content: "I think the grading for the last CTF was unfair."
      });

    expect(res.status).toBe(200);
    expect(res.body.trackingCode).toBeDefined();

    // Verify DB state
    const complaint = await prisma.complaint.findUnique({
      where: { trackingCode: res.body.trackingCode }
    });

    expect(complaint).toBeDefined();
    expect(complaint?.content).toBe("I think the grading for the last CTF was unfair.");
    
    // Type-level assertion: verify that `userId` does not exist on the Complaint model.
    const keys = Object.keys(complaint as any);
    expect(keys).not.toContain("userId");
    expect(keys).not.toContain("user_id");
  });
});
