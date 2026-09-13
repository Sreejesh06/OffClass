import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";

describe("Auth - Refresh Token Rotation & Reuse Detection", () => {
  it("should revoke entire token family when a rotated token is reused", async () => {
    // 1. Create a user directly
    const user = await prisma.user.create({
      data: {
        email: "test_auth@example.com",
        passwordHash: "hash",
        name: "Test Auth User",
        house: "BLUE",
      },
    });

    // 2. Login to get initial tokens
    // We'll mock the login payload to bypass bcrypt for speed in test, 
    // or just hit the real login endpoint if we hash properly.
    // Let's actually hit the register endpoint first to get valid hash.
    await prisma.user.delete({ where: { id: user.id } }); // remove dummy
    
    const regRes = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "test_auth@sece.ac.in",
        password: "Password123!",
        name: "Test Auth User"
      });
      
    expect(regRes.status).toBe(201);
    
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test_auth@sece.ac.in",
        password: "Password123!"
      });
      
    expect(loginRes.status).toBe(200);
    
    // Extract cookies
    const cookies = loginRes.headers["set-cookie"] as string[];
    const refreshTokenCookie1 = cookies.find(c => c.startsWith("refresh_token="));
    expect(refreshTokenCookie1).toBeDefined();

    // 3. First refresh (Valid)
    const refreshRes1 = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie1!);
      
    expect(refreshRes1.status).toBe(200);
    
    const cookies2 = refreshRes1.headers["set-cookie"] as string[];
    const refreshTokenCookie2 = cookies2.find(c => c.startsWith("refresh_token="));
    expect(refreshTokenCookie2).toBeDefined();
    
    // 4. Attempt to reuse the FIRST (now rotated/invalid) refresh token
    const refreshResReuse = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie1!);
      
    expect(refreshResReuse.status).toBe(401);
    
    // 5. Verify the entire token family was revoked by trying to use the SECOND token
    const refreshRes2 = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie2!);
      
    expect(refreshRes2.status).toBe(401); // Should fail because the family is burned!
    
    // Verify DB state
    const testUser = await prisma.user.findUnique({ where: { email: "test_auth@sece.ac.in" }});
    const familyTokens = await prisma.refreshToken.findMany({
      where: { userId: testUser!.id }
    });
    
    expect(familyTokens.length).toBeGreaterThan(0);
    expect(familyTokens.every(t => t.isRevoked)).toBe(true);
  });
});
