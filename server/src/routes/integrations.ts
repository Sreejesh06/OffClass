import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { generatePresignedPut, generatePresignedGet, deleteFile, fetchFileHeaderBytes, fetchObjectMetadata } from "../lib/minio.js";
import { getQueue } from "../lib/queue.js";
import { prisma } from "../lib/db.js";
import { fileTypeFromBuffer } from "file-type";
import type { Provider } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { computeAchievementHash } from "../lib/blockchain.js";
import { awardPoints } from "../lib/leaderboard.js";

const router: IRouter = Router();

const ProviderSchema = z.enum(["GITHUB", "CODEFORCES", "LEETCODE", "GFG", "HTB", "THM"]);

const ProviderRegex: Record<string, { regex: RegExp; description: string }> = {
  GITHUB: { regex: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, description: "Valid GitHub username required" },
  CODEFORCES: { regex: /^[a-zA-Z0-9_.-]{3,24}$/, description: "Valid Codeforces handle (3-24 characters) required" },
  LEETCODE: { regex: /^[a-zA-Z0-9_-]{3,30}$/, description: "Valid LeetCode username required" },
  GFG: { regex: /^[a-zA-Z0-9_-]{3,50}$/, description: "Valid GeeksForGeeks username required" },
  HTB: { regex: /^\d{1,10}$/, description: "HackTheBox numeric user ID required" },
  THM: { regex: /^[a-zA-Z0-9_.-]{3,30}$/, description: "Valid TryHackMe username required" },
};

const LinkSchema = z.object({
  provider: ProviderSchema,
  externalHandle: z.string().min(1).max(100),
}).superRefine((data, ctx) => {
  const validator = ProviderRegex[data.provider];
  if (validator && !validator.regex.test(data.externalHandle)) {
    ctx.addIssue({
      code: "custom",
      message: validator.description || "Invalid handle format",
      path: ["externalHandle"],
    });
  }
});

router.post("/link", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = LinkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid link data" });
      return;
    }

    const { provider, externalHandle } = parsed.data;
    const userId = req.user!.userId;

    const link = await prisma.profileLink.upsert({
      where: { userId_provider: { userId, provider: provider as Provider } },
      update: { externalHandle },
      create: { userId, provider: provider as Provider, externalHandle },
    });

    res.json({ link });
  } catch {
    res.status(500).json({ error: "Failed to link profile" });
  }
});

router.get("/links", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const links = await prisma.profileLink.findMany({
      where: { userId: req.user!.userId },
    });
    res.json({ links });
  } catch {
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

router.delete("/link/:provider", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const provider = ProviderSchema.parse((req.params.provider as string).toUpperCase()) as Provider;
    await prisma.profileLink.delete({
      where: { userId_provider: { userId: req.user!.userId, provider } },
    });
    res.json({ message: "Link removed" });
  } catch {
    res.status(400).json({ error: "Failed to remove link" });
  }
});

const SyncProviderSchema = z.enum(["GITHUB", "CODEFORCES", "LEETCODE", "GFG", "HTB", "THM"]);

router.post("/sync/:provider", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawProvider = req.params.provider;
    if (typeof rawProvider !== "string") {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }

    const provider = SyncProviderSchema.parse(rawProvider.toUpperCase()) as Provider;
    const userId = req.user!.userId;

    // Confirm the user has linked this platform
    const link = await prisma.profileLink.findUnique({
      where: { userId_provider: { userId, provider } },
    });

    if (!link) {
      res.status(400).json({ error: "Link this platform first via POST /link" });
      return;
    }

    // Rate-limit check: 60-second cooldown between syncs for the same provider
    const existingSync = await prisma.profileSync.findUnique({
      where: { userId_provider: { userId, provider } },
      select: { lastSyncedAt: true, status: true },
    });

    if (existingSync?.lastSyncedAt) {
      const COOLDOWN_MS = 60 * 1000; // 60 seconds
      const timeSinceSync = Date.now() - existingSync.lastSyncedAt.getTime();
      if (timeSinceSync < COOLDOWN_MS) {
        const remainingSecs = Math.ceil((COOLDOWN_MS - timeSinceSync) / 1000);
        res.status(429).json({ 
          error: `Please wait ${remainingSecs}s before syncing ${provider} again.` 
        });
        return;
      }
    }

    const queue = getQueue(provider);
    await queue.add(
      `sync-${provider}-${userId}`,
      {
        userId,
        provider,
        handle: link.externalHandle,
      },
      {
        jobId: `sync-${provider}-${userId}`,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    res.json({ message: `Sync job enqueued for ${provider}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid sync request" });
  }
});

router.get("/sync/status", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const syncs = await prisma.profileSync.findMany({
      where: { userId: req.user!.userId },
      select: {
        provider: true,
        parsedStats: true,
        lastSyncedAt: true,
        lastError: true,
        status: true,
      },
    });
    res.json({ syncs });
  } catch {
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
});

const PresignSchema = z.object({
  name: z.string().min(1).max(200),
  mimeType: z.string(),
});

router.post("/certs/presign", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mimeType } = PresignSchema.parse(req.body);
    const userId = req.user!.userId;

    const fileKey = `certs/${userId}/${crypto.randomBytes(16).toString("hex")}`;
    const uploadUrl = await generatePresignedPut(fileKey, mimeType);

    await prisma.certificate.create({
      data: { userId, name, fileKey, mimeType: "UNKNOWN", status: "PENDING_VERIFICATION" },
    });

    res.json({ uploadUrl, fileKey });
  } catch {
    res.status(400).json({ error: "Failed to generate presigned URL" });
  }
});

router.post("/certs/verify", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileKey } = req.body;
    if (!fileKey || typeof fileKey !== "string") {
      res.status(400).json({ error: "fileKey is required" });
      return;
    }

    const cert = await prisma.certificate.findUnique({ where: { fileKey } });
    if (!cert || cert.userId !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden or not found" });
      return;
    }

    // Enforce 10MB file size limit
    const MAX_CERT_SIZE = 10 * 1024 * 1024; // 10MB
    const metadata = await fetchObjectMetadata(fileKey);
    if (metadata.size > MAX_CERT_SIZE) {
      await deleteFile(fileKey);
      await prisma.certificate.update({
        where: { fileKey },
        data: { status: "REJECTED_EXCEEDED_SIZE" },
      });
      res.status(400).json({ error: "File size exceeds the 10MB maximum limit. File deleted." });
      return;
    }

    const headerBytes = await fetchFileHeaderBytes(fileKey);
    const typeInfo = await fileTypeFromBuffer(headerBytes);
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!typeInfo || !allowedTypes.includes(typeInfo.mime)) {
      await deleteFile(fileKey);
      await prisma.certificate.update({
        where: { fileKey },
        data: { status: "REJECTED_INVALID_TYPE" },
      });
      res.status(400).json({ error: "Invalid file type. File deleted." });
      return;
    }

    await prisma.certificate.update({
      where: { fileKey },
      data: { status: "UPLOADED", mimeType: typeInfo.mime },
    });

    res.json({ message: "File verified and awaiting review", mimeType: typeInfo.mime });
  } catch {
    res.status(500).json({ error: "Failed to verify file" });
  }
});

router.get("/certs/:id/view", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const certId = req.params["id"] as string;
    const cert = await prisma.certificate.findUnique({ where: { id: certId } });
    if (!cert) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Enforce ownership: only the cert owner or an admin/teacher can view it
    const requestorRole = req.user!.role;
    if (cert.userId !== req.user!.userId && requestorRole !== "ADMIN" && requestorRole !== "TEACHER") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const url = await generatePresignedGet(cert.fileKey);
    res.json({ url });
  } catch {
    res.status(500).json({ error: "Failed to generate view URL" });
  }
});

router.delete("/certs/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const certId = req.params["id"] as string;
    const cert = await prisma.certificate.findUnique({ where: { id: certId } });
    if (!cert || cert.userId !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden or not found" });
      return;
    }

    // If deleting an approved certificate, deduct the awarded points
    if (cert.status === "APPROVED") {
      const certUser = await prisma.user.findUnique({ where: { id: cert.userId }, select: { house: true } });
      if (certUser) {
        await awardPoints(cert.userId, certUser.house, -100, `Certificate Removed: ${cert.name}`, "CERTIFICATE", cert.id);
      }
    }

    await deleteFile(cert.fileKey);
    await prisma.certificate.delete({ where: { id: certId } });
    res.json({ success: true, message: cert.status === "APPROVED" ? "Certificate deleted and points adjusted." : "Certificate deleted." });
  } catch {
    res.status(500).json({ error: "Failed to delete certificate" });
  }
});

const ReorderSchema = z.object({
  certIds: z.array(z.string()),
});

router.patch("/certs/reorder", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { certIds } = ReorderSchema.parse(req.body);
    
    // Check ownership of all certs
    const certs = await prisma.certificate.findMany({
      where: { id: { in: certIds } },
    });
    if (certs.some(c => c.userId !== req.user!.userId)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Update orders sequentially
    await prisma.$transaction(
      certIds.map((id, index) => 
        prisma.certificate.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    res.json({ success: true });
  } catch (e: any) {
    if (e.name === "ZodError" || e.issues) {
      res.status(400).json({ error: e.issues?.[0]?.message || e.errors?.[0]?.message || "Invalid input" });
      return;
    }
    res.status(500).json({ error: "Failed to reorder certificates" });
  }
});

router.get("/verify/:achievementId", async (req: Request, res: Response): Promise<void> => {
    try {
        const achievementId = req.params.achievementId as string;
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId },
            include: { user: { select: { name: true, house: true } } }
        });
        
        if (!achievement) {
            res.status(404).json({ error: "Achievement not found" });
            return;
        }
        
        if (achievement.status !== "APPROVED") {
            res.status(400).json({ error: "Achievement is not yet approved" });
            return;
        }

        // Recompute what the hash *should* be based on our DB
        const expectedHash = computeAchievementHash(achievement);
        
        res.json({
            achievement: {
                title: achievement.title,
                category: achievement.category,
                student: achievement.user.name,
                date: achievement.date
            },
            expectedHash,
            txHash: achievement.blockchainTxHash
        });
    } catch (error) {
        res.status(500).json({ error: "Verification lookup failed" });
    }
});

export default router;
