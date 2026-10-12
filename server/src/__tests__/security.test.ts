import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";
import { generateAccessToken } from "../lib/auth.js";

describe("WAPT Security Regressions", () => {
  it("SEC-01: Notifications endpoint must only return the authenticated user's notifications", async () => {
    // 1. Create two distinct users
    const userA = await prisma.user.create({
      data: {
        email: "usera@sece.ac.in",
        name: "User A",
        passwordHash: "dummyhash",
        house: "RED",
        role: "STUDENT"
      }
    });

    const userB = await prisma.user.create({
      data: {
        email: "userb@sece.ac.in",
        name: "User B",
        passwordHash: "dummyhash",
        house: "BLUE",
        role: "STUDENT"
      }
    });

    // 2. Create a notification for User B
    const notifB = await prisma.notification.create({
      data: {
        userId: userB.id,
        title: "Confidential Warning",
        message: "Private discipline notice for User B"
      }
    });

    // 3. User A queries notifications
    const tokenA = generateAccessToken(userA.id, userA.role);
    const resA = await request(app)
      .get("/api/notifications")
      .set("Cookie", `access_token=${tokenA}`);

    expect(resA.status).toBe(200);
    // User A must NOT receive User B's notification
    expect(resA.body.notifications).toHaveLength(0);

    // 4. User B queries notifications
    const tokenB = generateAccessToken(userB.id, userB.role);
    const resB = await request(app)
      .get("/api/notifications")
      .set("Cookie", `access_token=${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.notifications).toHaveLength(1);
    expect(resB.body.notifications[0].id).toBe(notifB.id);
  });

  it("SEC-02: Work experience IDOR - User A cannot overwrite User B's experience", async () => {
    const userA = await prisma.user.create({
      data: {
        email: "student_a@sece.ac.in",
        name: "Student A",
        passwordHash: "dummyhash",
        house: "GREEN",
        role: "STUDENT"
      }
    });

    const userB = await prisma.user.create({
      data: {
        email: "student_b@sece.ac.in",
        name: "Student B",
        passwordHash: "dummyhash",
        house: "PURPLE",
        role: "STUDENT"
      }
    });

    // User B has a genuine work experience
    const expB = await prisma.workExperience.create({
      data: {
        userId: userB.id,
        company: "Legit Security Corp",
        role: "Security Engineer",
        duration: "6 months",
        description: "Vulnerability analysis"
      }
    });

    // User A attempts to overwrite User B's work experience
    const tokenA = generateAccessToken(userA.id, userA.role);
    const patchRes = await request(app)
      .patch("/api/users/me/profile")
      .set("Cookie", `access_token=${tokenA}`)
      .send({
        workExperiences: [
          {
            id: expB.id, // Targeting User B's ID!
            company: "Malicious Tampered Company",
            role: "Hacked Role",
            duration: "1 day"
          }
        ]
      });

    expect(patchRes.status).toBe(200);

    // Verify User B's work experience was untouched
    const checkB = await prisma.workExperience.findUnique({
      where: { id: expB.id }
    });

    expect(checkB?.company).toBe("Legit Security Corp");
    expect(checkB?.role).toBe("Security Engineer");
  });

  it("SEC-09: Password reset must reject passwords shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "some-dummy-token",
        password: "short"
      });

    // Zod validation should reject short passwords with 400 Bad Request
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Password must be at least 8 characters");
  });

  it("Cert Management: Deleting an approved cert deletes the file and deducts awarded points", async () => {
    const student = await prisma.user.create({
      data: {
        email: "cert_student@sece.ac.in",
        name: "Cert Student",
        passwordHash: "dummyhash",
        house: "RED",
        role: "STUDENT",
        points: 100 // Awarded points
      }
    });

    const cert = await prisma.certificate.create({
      data: {
        userId: student.id,
        name: "OSCP",
        fileKey: "certs/test-oscp",
        mimeType: "application/pdf",
        status: "APPROVED"
      }
    });

    const token = generateAccessToken(student.id, student.role);
    const deleteRes = await request(app)
      .delete(`/api/integrations/certs/${cert.id}`)
      .set("Cookie", `access_token=${token}`);

    expect(deleteRes.status).toBe(200);

    // Verify cert is deleted
    const checkCert = await prisma.certificate.findUnique({ where: { id: cert.id } });
    expect(checkCert).toBeNull();

    // Verify points were deducted
    const updatedStudent = await prisma.user.findUnique({ where: { id: student.id } });
    expect(updatedStudent?.points).toBe(0);
  });

  it("Discipline Guard: Rejects non-finite points (Infinity/NaN)", async () => {
    const teacher = await prisma.user.create({
      data: {
        email: "teacher_disc@sece.ac.in",
        name: "Teacher Discipline",
        passwordHash: "dummyhash",
        house: "BLUE",
        role: "TEACHER"
      }
    });

    const token = generateAccessToken(teacher.id, teacher.role);
    const res = await request(app)
      .post("/api/admin/discipline")
      .set("Cookie", `access_token=${token}`)
      .send({
        userId: "dummy-id",
        violation: "Cheating",
        pointsDeducted: 99999999 // Exceeds max 10000
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("positive finite pointsDeducted (max 10000) required");
  });

  it("SEC-10: Strong password policy enforces entropy rules", async () => {
    // Missing uppercase
    const resNoUpper = await request(app)
      .post("/api/auth/signup")
      .send({ email: "entropy1@sece.ac.in", name: "User", password: "password123!" });
    expect(resNoUpper.status).toBe(400);
    expect(resNoUpper.body.error).toContain("uppercase");

    // Missing lowercase
    const resNoLower = await request(app)
      .post("/api/auth/signup")
      .send({ email: "entropy2@sece.ac.in", name: "User", password: "PASSWORD123!" });
    expect(resNoLower.status).toBe(400);
    expect(resNoLower.body.error).toContain("lowercase");

    // Missing number
    const resNoNum = await request(app)
      .post("/api/auth/signup")
      .send({ email: "entropy3@sece.ac.in", name: "User", password: "Password!!!!" });
    expect(resNoNum.status).toBe(400);
    expect(resNoNum.body.error).toContain("number");

    // Missing special symbol
    const resNoSym = await request(app)
      .post("/api/auth/signup")
      .send({ email: "entropy4@sece.ac.in", name: "User", password: "Password123" });
    expect(resNoSym.status).toBe(400);
    expect(resNoSym.body.error).toContain("special character");
  });

  it("SEC-11: Account lockout & Login audit logging after consecutive failed attempts", async () => {
    // 1. Create a student with compliant password
    const regRes = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "lockout_victim@sece.ac.in",
        name: "Lockout Victim",
        password: "CorrectPass@123!"
      });
    expect(regRes.status).toBe(201);

    // 2. Attempt 4 wrong logins -> verify status 401 and attempts feedback
    for (let i = 1; i <= 4; i++) {
      const failRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "lockout_victim@sece.ac.in", password: "WrongPassword@123!" });
      expect(failRes.status).toBe(401);
      expect(failRes.body.error).toContain(`${5 - i} attempt`);
    }

    // 3. Attempt 5th wrong login -> triggers lockout (status 423)
    const lockRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "lockout_victim@sece.ac.in", password: "WrongPassword@123!" });
    expect(lockRes.status).toBe(423);
    expect(lockRes.body.error).toContain("Account locked for 15 minutes");

    // 4. Attempt 6th login (even with correct password) -> still blocked by active lockout!
    const blockedRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "lockout_victim@sece.ac.in", password: "CorrectPass@123!" });
    expect(blockedRes.status).toBe(423);
    expect(blockedRes.body.error).toContain("Account temporarily locked");

    // 5. Verify DB state & AuditLog records
    const user = await prisma.user.findUnique({ where: { email: "lockout_victim@sece.ac.in" } });
    expect(user).toBeDefined();
    expect(user?.failedLoginAttempts).toBe(5);
    expect(user?.lockedUntil).not.toBeNull();

    const auditLogs = await prisma.auditLog.findMany({
      where: { targetId: user!.id },
      orderBy: { createdAt: "desc" }
    });
    const actions = auditLogs.map(l => l.action);
    expect(actions).toContain("LOGIN_FAILED");
    expect(actions).toContain("ACCOUNT_LOCKED");
  });

  it("SEC-12: Centralized error handling returns 404 on unmatched route", async () => {
    const res = await request(app).get("/api/unmatched-nonexistent-endpoint-xyz");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });
});
