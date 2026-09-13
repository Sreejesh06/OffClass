import { Router, type Router as IRouter } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../lib/db.js";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  hashToken, 
  setAuthCookies, 
  clearAuthCookies 
} from "../lib/auth.js";
import { SignupPayloadSchema, LoginPayloadSchema } from "shared";
import { requireAuth } from "../middlewares/requireAuth.js";

const router: IRouter = Router();

router.post("/signup", async (req, res): Promise<void> => {
  try {
    const payload = SignupPayloadSchema.parse(req.body);
    
    // Check email domain in a transaction to prevent TOCTOU
    const user = await prisma.$transaction(async (tx) => {
      // Must be a college email
      if (!payload.email.endsWith("@sece.ac.in")) {
        throw new Error("Only @sece.ac.in emails are allowed");
      }

      const existingUser = await tx.user.findUnique({
        where: { email: payload.email },
      });

      if (existingUser) {
        throw new Error("Email already in use");
      }

      // Randomly assign a house for phase 0 testing
      const houses = ["RED", "BLUE", "GREEN", "PURPLE"] as const;
      const assignedHouse = houses[Math.floor(Math.random() * houses.length)]!;
      
      const passwordHash = await bcrypt.hash(payload.password, 10);
      
      return tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          passwordHash,
          house: assignedHouse,
          role: "STUDENT", // Default to student
        },
      });
    });

    res.status(201).json({ message: "User created", userId: user.id });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res): Promise<void> => {
  try {
    const payload = LoginPayloadSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    
    await prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(refreshToken),
        familyId: crypto.randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: "Logged in successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res): Promise<void> => {
  const token = req.cookies.refresh_token;
  
  if (!token) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  const hashedToken = hashToken(token);

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    if (!storedToken) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Reuse detection! If token was already revoked, compromise is highly likely.
    if (storedToken.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId },
        data: { isRevoked: true },
      });
      clearAuthCookies(res);
      res.status(401).json({ error: "Token compromise detected. Please login again." });
      return;
    }

    if (new Date() > storedToken.expiresAt) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Token expired" });
      return;
    }

    // Mark current token as revoked
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Issue new token pair
    const newAccessToken = generateAccessToken(storedToken.userId, storedToken.user.role);
    const newRefreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(newRefreshToken),
        familyId: storedToken.familyId, // Same family
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ message: "Tokens refreshed" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", requireAuth, async (req, res): Promise<void> => {
  const token = req.cookies.refresh_token;
  
  if (token) {
    const hashedToken = hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { hashedToken },
      data: { isRevoked: true },
    });
  }

  clearAuthCookies(res);
  res.json({ message: "Logged out" });
});

export default router;
