import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { generatePresignedPut, deleteFile, fetchFileHeaderBytes } from "../lib/minio.js";
import { getQueue } from "../lib/queue.js";
import { prisma } from "../lib/db.js";
import { fileTypeFromBuffer } from "file-type";
import type { Provider } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

const ProviderSchema = z.enum(["GITHUB", "CODEFORCES", "LEETCODE", "GFG", "HTB", "THM"]);

const LinkSchema = z.object({
  provider: ProviderSchema,
  externalHandle: z.string().min(1).max(100),
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

const SyncProviderSchema = z.enum(["CODEFORCES", "LEETCODE", "GFG", "HTB", "THM"]);

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

    const queue = getQueue(provider);
    await queue.add(`sync-${provider}-${userId}`, {
      userId,
      provider,
      handle: link.externalHandle,
    });

    res.json({ message: `Sync job enqueued for ${provider}` });
  } catch {
    res.status(400).json({ error: "Invalid sync request" });
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

    res.json({ message: "File verified", mimeType: typeInfo.mime });
  } catch {
    res.status(500).json({ error: "Failed to verify file" });
  }
});

export default router;
