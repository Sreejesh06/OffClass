import { Router, type Router as IRouter, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import * as otplib from "otplib";
const { authenticator } = otplib;
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
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
import { sendEmail } from "../lib/mailer.js";

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
      
      const newUser = await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          passwordHash,
          house: assignedHouse,
          role: "STUDENT", // Default to student
        },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await tx.verificationToken.create({
        data: {
          email: newUser.email,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });

      return { user: newUser, token };
    });

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${user.token}`;
    await sendEmail({
      to: user.user.email,
      subject: "Verify your Cryptid account",
      html: `Welcome to Cryptid! Click <a href="${verificationUrl}">here</a> to verify your email.`,
    });

    res.status(201).json({ message: "User created. Please check your email to verify your account.", userId: user.user.id });
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

    if (!user.emailVerified) {
      res.status(401).json({ error: "Please verify your email before logging in." });
      return;
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Require TOTP for elevated roles
    if (user.role !== "STUDENT" && user.isTotpEnabled) {
      // Issue a 5-minute temporary token instead of full access
      const tempToken = jwt.sign(
        { userId: user.id, role: user.role, requireTotp: true },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
      );
      res.json({ requireTotp: true, tempToken });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          hashedToken: hashToken(refreshToken),
          familyId: crypto.randomUUID(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    ]);

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

router.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, house: true, points: true, isTotpEnabled: true }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login/totp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, code } = req.body;
    
    // Verify temp token
    const payload = jwt.verify(
      tempToken,
      process.env.JWT_SECRET!
    ) as any;

    if (!payload.requireTotp) {
      res.status(400).json({ error: "Invalid token type" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.totpSecret) {
      res.status(400).json({ error: "2FA not set up" });
      return;
    }

    // Verify 6-digit code natively using otplib
    const isValid = authenticator.check(code, user.totpSecret);
    if (!isValid) {
      res.status(401).json({ error: "Invalid 2FA code" });
      return;
    }

    // Success! Mint the real tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    const hashedToken = hashToken(refreshToken);
    const familyId = crypto.randomBytes(16).toString("hex");

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          hashedToken,
          userId: user.id,
          familyId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    ]);

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: "Login successful via 2FA" });
  } catch {
    res.status(401).json({ error: "Invalid or expired temporary token" });
  }
});

router.post("/2fa/setup", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || user.role === "STUDENT") {
      res.status(403).json({ error: "Only admins/teachers can set up 2FA" });
      return;
    }

    if (user.isTotpEnabled) {
      res.status(400).json({ error: "2FA is already fully enabled" });
      return;
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, "Cryptid", secret);
    
    // Save secret temporarily (not fully enabled yet until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret }
    });

    // Generate the QR code image for Google Authenticator / Authy
    const qrCodeUrl = await qrcode.toDataURL(otpauth);
    res.json({ secret, qrCodeUrl });
  } catch {
    res.status(500).json({ error: "Failed to generate 2FA setup" });
  }
});

router.post("/2fa/verify-setup", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    
    if (!user || !user.totpSecret) {
      res.status(400).json({ error: "2FA setup not initiated" });
      return;
    }

    const isValid = authenticator.check(code, user.totpSecret);
    if (!isValid) {
      res.status(400).json({ error: "Invalid code" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isTotpEnabled: true }
    });

    res.json({ message: "2FA successfully enabled!" });
  } catch {
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
});

router.post("/resend-verification", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak user existence
      res.json({ message: "If your email is registered and unverified, a new link was sent." });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    await prisma.verificationToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Verify your Cryptid account",
      html: `Welcome to Cryptid! Click <a href="${verificationUrl}">here</a> to verify your email.`,
    });

    res.json({ message: "If your email is registered and unverified, a new link was sent." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    if (new Date() > verificationToken.expiresAt) {
      res.status(400).json({ error: "Token expired" });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
    ]);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether the email exists
      res.json({ message: "If an account with that email exists, we sent a password reset link." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    
    // Clear any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your Cryptid password",
      html: `Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.`,
    });

    res.json({ message: "If an account with that email exists, we sent a password reset link." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    if (new Date() > resetToken.expiresAt) {
      res.status(400).json({ error: "Token expired" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
      // Revoke all existing sessions
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      })
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
