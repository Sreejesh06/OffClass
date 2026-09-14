import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { getHouseKey } from "../lib/leaderboard.js";
import jwt from "jsonwebtoken";

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "super_secret_fallback_key", {
    expiresIn: "15m",
  });
};

describe("House Transfer Ticket System", () => {
  it("should enforce validation on student house transfer tickets", async () => {
    const student = await prisma.user.create({
      data: {
        email: "student1@example.com",
        passwordHash: "hash",
        name: "Alice",
        house: "RED",
        role: "STUDENT",
      },
    });

    const token = generateToken(student.id, "STUDENT");

    // 1. Cannot request current house
    const sameHouseRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${token}`)
      .send({ targetHouse: "RED", reason: "I want to switch to red house" });

    expect(sameHouseRes.status).toBe(400);
    expect(sameHouseRes.body.error).toContain("already a member");

    // 2. Reason must be >= 10 characters
    const shortReasonRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${token}`)
      .send({ targetHouse: "BLUE", reason: "too short" });

    expect(shortReasonRes.status).toBe(400);
  });

  it("should allow student to submit ticket and prevent duplicate pending tickets", async () => {
    const student = await prisma.user.create({
      data: {
        email: "student2@example.com",
        passwordHash: "hash",
        name: "Bob",
        house: "BLUE",
        role: "STUDENT",
      },
    });

    const token = generateToken(student.id, "STUDENT");

    // Submit ticket
    const createRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${token}`)
      .send({
        targetHouse: "GREEN",
        reason: "Switching focus to DevSecOps and secure software development",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.request.status).toBe("PENDING");
    expect(createRes.body.request.targetHouse).toBe("GREEN");

    // Attempt second ticket while pending
    const dupRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${token}`)
      .send({
        targetHouse: "PURPLE",
        reason: "Actually want to do cryptography research",
      });

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.error).toContain("already have a pending house transfer request");

    // Student can check status
    const statusRes = await request(app)
      .get("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${token}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.hasPending).toBe(true);
    expect(statusRes.body.request.targetHouse).toBe("GREEN");
  });

  it("should allow teacher to reject a ticket without changing student house", async () => {
    const student = await prisma.user.create({
      data: {
        email: "student3@example.com",
        passwordHash: "hash",
        name: "Charlie",
        house: "PURPLE",
        role: "STUDENT",
      },
    });
    const teacher = await prisma.user.create({
      data: {
        email: "teacher1@example.com",
        passwordHash: "hash",
        name: "Prof X",
        house: "PURPLE",
        role: "TEACHER",
      },
    });

    const studentToken = generateToken(student.id, "STUDENT");
    const teacherToken = generateToken(teacher.id, "TEACHER");

    // Student creates ticket
    const createRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${studentToken}`)
      .send({
        targetHouse: "RED",
        reason: "Want to do offensive red-teaming exercises",
      });

    const ticketId = createRes.body.request.id;

    // Teacher views approvals
    const approvalsRes = await request(app)
      .get("/api/admin/approvals")
      .set("Cookie", `access_token=${teacherToken}`);

    expect(approvalsRes.status).toBe(200);
    const item = approvalsRes.body.approvals.find((a: any) => a.id === ticketId);
    expect(item).toBeDefined();
    expect(item.type).toBe("HOUSE_TRANSFER");

    // Teacher rejects ticket
    const rejectRes = await request(app)
      .post(`/api/admin/house-transfers/${ticketId}/review`)
      .set("Cookie", `access_token=${teacherToken}`)
      .send({ action: "reject", notes: "Purple house needs your cryptography skills this term" });

    expect(rejectRes.status).toBe(200);

    // Verify student house is STILL PURPLE
    const updatedUser = await prisma.user.findUnique({ where: { id: student.id } });
    expect(updatedUser?.house).toBe("PURPLE");

    // Verify ticket is REJECTED
    const updatedTicket = await prisma.houseTransferRequest.findUnique({ where: { id: ticketId } });
    expect(updatedTicket?.status).toBe("REJECTED");
    expect(updatedTicket?.reviewNotes).toContain("Purple house needs");
  });

  it("should allow teacher to approve ticket, updating user house and Redis leaderboard", async () => {
    const student = await prisma.user.create({
      data: {
        email: "student4@example.com",
        passwordHash: "hash",
        name: "Dana",
        house: "RED",
        points: 250,
        role: "STUDENT",
      },
    });
    const teacher = await prisma.user.create({
      data: {
        email: "teacher2@example.com",
        passwordHash: "hash",
        name: "Prof Y",
        house: "RED",
        role: "TEACHER",
      },
    });

    // Seed Redis leaderboard with student's points in RED house
    await redis.zadd(getHouseKey("RED"), 250, student.id);

    const studentToken = generateToken(student.id, "STUDENT");
    const teacherToken = generateToken(teacher.id, "TEACHER");

    // Student raises ticket
    const createRes = await request(app)
      .post("/api/users/me/house-transfer")
      .set("Cookie", `access_token=${studentToken}`)
      .send({
        targetHouse: "BLUE",
        reason: "Moving from offensive security to incident response specialization",
      });

    const ticketId = createRes.body.request.id;

    // Teacher approves ticket
    const approveRes = await request(app)
      .post(`/api/admin/house-transfers/${ticketId}/review`)
      .set("Cookie", `access_token=${teacherToken}`)
      .send({ action: "approve", notes: "Transfer approved. Good luck in Blue House." });

    expect(approveRes.status).toBe(200);

    // Verify user house changed to BLUE in DB
    const updatedUser = await prisma.user.findUnique({ where: { id: student.id } });
    expect(updatedUser?.house).toBe("BLUE");

    // Verify ticket marked APPROVED
    const updatedTicket = await prisma.houseTransferRequest.findUnique({ where: { id: ticketId } });
    expect(updatedTicket?.status).toBe("APPROVED");

    // Verify Redis leaderboard: removed from RED, present in BLUE
    const redScore = await redis.zscore(getHouseKey("RED"), student.id);
    const blueScore = await redis.zscore(getHouseKey("BLUE"), student.id);

    expect(redScore).toBeNull();
    expect(blueScore).toBe("250");
  });
});
