import { Router, type Router as IRouter, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { generatePresignedPut, deleteFile, fetchFileHeaderBytes } from "../lib/minio.js";
import { syncQueue } from "../lib/queue.js";
import { prisma } from "../lib/db.js";
import { fileTypeFromBuffer } from "file-type";
import type { Platform } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

const PresignSchema = z.object({
  mimeType: z.string(), // The client *claims* this mime type
});

router.post("/certs/presign", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mimeType } = PresignSchema.parse(req.body);
    const userId = req.user!.userId;
    
    // Generate a random file key to prevent overwrites/collisions
    const fileKey = `certs/${userId}/${crypto.randomBytes(16).toString("hex")}`;
    
    const uploadUrl = await generatePresignedPut(fileKey, mimeType);
    
    // Save to DB as PENDING
    await prisma.certificate.create({
      data: {
        userId,
        fileKey,
        mimeType: "UNKNOWN", // We will trust the magic bytes, not the client
        status: "PENDING_VERIFICATION"
      }
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

    // 1. Fetch the first 4KB using HTTP Range
    const headerBytes = await fetchFileHeaderBytes(fileKey);
    
    // 2. Sniff the magic bytes natively on the server
    const typeInfo = await fileTypeFromBuffer(headerBytes);
    
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    
    if (!typeInfo || !allowedTypes.includes(typeInfo.mime)) {
      // It's malware or an incorrect file. Destroy it from MinIO.
      await deleteFile(fileKey);
      await prisma.certificate.update({
        where: { fileKey },
        data: { status: "REJECTED_INVALID_TYPE" }
      });
      res.status(400).json({ error: "Invalid file type. File deleted." });
      return;
    }

    // It's safe! Update the DB with the absolute true mime type.
    await prisma.certificate.update({
      where: { fileKey },
      data: { 
        status: "UPLOADED",
        mimeType: typeInfo.mime
      }
    });

    res.json({ message: "File verified and accepted", mimeType: typeInfo.mime });
  } catch {
    res.status(500).json({ error: "Failed to verify file" });
  }
});

const PlatformSchema = z.enum(["GITHUB", "CODEFORCES", "LEETCODE", "HTB", "THM"]);

router.post("/sync/:platform", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPlatform = req.params.platform;
    if (typeof rawPlatform !== "string") {
      res.status(400).json({ error: "Invalid platform parameter" });
      return;
    }

    const platform = PlatformSchema.parse(rawPlatform.toUpperCase()) as Platform;
    const { handle } = req.body;
    if (!handle || typeof handle !== "string") {
      res.status(400).json({ error: "handle is required" });
      return;
    }

    // Add job to BullMQ
    await syncQueue.add("platform-sync-job", {
      userId: req.user!.userId,
      platform,
      handle
    });

    res.json({ message: "Sync job enqueued" });
  } catch {
    res.status(400).json({ error: "Invalid sync request" });
  }
});

export default router;
