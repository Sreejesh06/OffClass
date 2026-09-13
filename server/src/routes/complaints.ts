import { Router, type Router as IRouter, type Request, type Response } from "express";
import { generateChallenge, verifyChallenge } from "../lib/pow.js";
import { prisma } from "../lib/db.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

router.get("/challenge", async (_req: Request, res: Response): Promise<void> => {
  try {
    const seed = await generateChallenge();
    const difficulty = (process.env.NODE_ENV === 'test' || process.env.MOCK_MINIO === 'true') ? 1 : 5;
    res.json({ seed, difficulty });
  } catch {
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

const SubmitSchema = z.object({
  seed: z.string(),
  nonce: z.string(),
  category: z.enum(["GRADING", "HARASSMENT", "PLATFORM_BUG", "OTHER"]),
  content: z.string().min(10).max(2000),
});

router.post("/submit", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = SubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid submission format" });
      return;
    }

    const { seed, nonce, category, content } = parsed.data;

    // 1. Identity-free rate limit check (Proof of Work)
    const isValid = await verifyChallenge(seed, nonce);
    if (!isValid) {
      res.status(400).json({ error: "Invalid or expired proof of work" });
      return;
    }

    // 2. Generate secure tracking code
    const trackingCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars

    // 3. Time bucket to destroy second-level correlation attacks
    const reportedDay = new Date().toISOString().split("T")[0]!; // YYYY-MM-DD

    // 4. Secure Insert (No user FK, No IP, No exact time)
    await prisma.complaint.create({
      data: {
        trackingCode,
        category,
        content,
        reportedDay,
        status: "SUBMITTED"
      }
    });

    res.json({ trackingCode, message: "Complaint securely submitted. Save this tracking code." });
  } catch {
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

router.get("/status/:trackingCode", async (req: Request, res: Response): Promise<void> => {
  try {
    const trackingCode = req.params.trackingCode;
    if (typeof trackingCode !== "string") {
       res.status(400).json({ error: "Invalid tracking code" });
       return;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { trackingCode },
      select: { category: true, status: true, reportedDay: true, adminNotes: true } // Safely exclude internal UUID
    });

    if (!complaint) {
      res.status(404).json({ error: "Complaint not found" });
      return;
    }

    res.json(complaint);
  } catch {
    res.status(500).json({ error: "Failed to check status" });
  }
});

router.get("/admin", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { reportedDay: "desc" }
    });
    res.json({ complaints });
  } catch {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

const UpdateStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "REJECTED"]).optional(),
  adminNotes: z.string().optional(),
});

router.patch("/admin/:id", requireAuth, requireRole(["ADMIN", "TEACHER"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (typeof id !== "string") {
        res.status(400).json({ error: "Invalid ID" });
        return;
    }
    
    const parsed = UpdateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update data" });
      return;
    }

    const updateData = {
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes })
    };

    await prisma.complaint.update({
      where: { id },
      data: updateData
    });

    res.json({ message: "Complaint updated" });
  } catch {
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

export default router;
