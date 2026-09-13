import { Queue } from "bullmq";
import { redis } from "./redis.js";
import type { Provider } from "@prisma/client";

export interface SyncJobData {
  userId: string;
  provider: Provider;
  handle: string;
}

interface QueueConfig {
  concurrency: number;
  rateMax: number;
  rateDuration: number;
}

const QUEUE_CONFIGS: Record<string, QueueConfig> = {
  codeforces: { concurrency: 5, rateMax: 10, rateDuration: 1000 },
  leetcode:   { concurrency: 3, rateMax: 5,  rateDuration: 1000 },
  gfg:        { concurrency: 3, rateMax: 5,  rateDuration: 1000 },
  htb:        { concurrency: 2, rateMax: 3,  rateDuration: 1000 },
  thm:        { concurrency: 3, rateMax: 5,  rateDuration: 1000 },
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 2000 },
  removeOnComplete: true,
};
const queues = new Map<string, Queue<SyncJobData>>();

for (const name of Object.keys(QUEUE_CONFIGS)) {
  queues.set(
    name,
    new Queue<SyncJobData>(name, { connection: redis, defaultJobOptions: { removeOnComplete: true, removeOnFail: 1000 }, prefix: 'sync' })
  );
}

export const getQueue = (provider: Provider): Queue<SyncJobData> => {
  const key = provider.toLowerCase();
  const queue = queues.get(key);
  if (!queue) throw new Error(`No sync queue configured for provider: ${provider}`);
  return queue;
};

export { QUEUE_CONFIGS };
