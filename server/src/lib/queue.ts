import { Queue } from "bullmq";
import { redis } from "./redis.js";
import type { Platform } from "@prisma/client";

export interface SyncJobData {
  userId: string;
  platform: Platform;
  handle: string;
}

export const syncQueue = new Queue<SyncJobData>("platform-sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: { type: "exponential", delay: 1000 }, // Wait 1s, 2s, 4s...
    removeOnComplete: true, // Keep Redis memory clean
  },
});
