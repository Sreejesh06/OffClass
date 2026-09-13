import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/db.js";
import jwt from "jsonwebtoken";

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "super_secret_fallback_key", {
    expiresIn: "15m",
  });
};

describe("RBAC Boundaries", () => {
  it("should block STUDENT from accessing TEACHER/ADMIN endpoints", async () => {
    const student = await prisma.user.create({
      data: {
        email: "student@example.com",
        passwordHash: "hash",
        name: "Student",
        house: "GREEN",
        role: "STUDENT"
      },
    });

    const token = generateToken(student.id, "STUDENT");

    const res = await request(app)
      .get("/api/admin/export/students")
      .set("Cookie", `access_token=${token}`);

    expect(res.status).toBe(403);
  });
  
  it("should allow TEACHER to access export endpoint", async () => {
    const teacher = await prisma.user.create({
      data: {
        email: "teacher@example.com",
        passwordHash: "hash",
        name: "Teacher",
        house: "GREEN",
        role: "TEACHER"
      },
    });

    const token = generateToken(teacher.id, "TEACHER");

    const res = await request(app)
      .get("/api/admin/export/students")
      .set("Cookie", `access_token=${token}`);

    expect(res.status).toBe(200);
  });
});
