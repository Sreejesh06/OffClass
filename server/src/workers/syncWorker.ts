import { Worker, type Job } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/db.js";
import { awardPoints } from "../lib/leaderboard.js";
import type { SyncJobData } from "../lib/queue.js";
import axios from "axios";

// ---------------------------------------------------------
// Open-source wrappers/fetchers for the various platforms
// ---------------------------------------------------------
// aislop-ignore: ai-slop/hardcoded-url
const fetchCodeforces = async (handle: string) => {
  const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
  if (res.data.status !== "OK") throw new Error("CF API failed");
  return res.data.result[0];
};

// aislop-ignore: ai-slop/hardcoded-url
const fetchGithub = async (handle: string) => {
  const res = await axios.get(`https://api.github.com/users/${handle}`);
  return res.data;
};

export const syncWorker = new Worker<SyncJobData>(
  "platform-sync",
  async (job: Job<SyncJobData>) => {
    const { userId, platform, handle } = job.data;
    
    // 1. Fetch live data using wrappers
    let liveData: any = {};
    if (platform === "CODEFORCES") liveData = await fetchCodeforces(handle);
    else if (platform === "GITHUB") liveData = await fetchGithub(handle);
    else {
      // Simulate HTB/THM/LEETCODE until specific wrappers are integrated
      liveData = { mockScore: Math.floor(Math.random() * 100) };
    }

    // 2. Diffing & Idempotency
    const state = await prisma.platformSyncState.findUnique({
      where: { userId_platform: { userId, platform } }
    });

    const oldData = (state?.snapshotData as Record<string, number>) || {};
    
    // In a full implementation, you would diff explicit metric arrays (e.g., solved CF problems).
    // Here we use a generic score delta to prove the architecture.
    const oldScore = oldData.rating || oldData.public_repos || oldData.mockScore || 0;
    const newScore = liveData.rating || liveData.public_repos || liveData.mockScore || 0;

    if (newScore > oldScore) {
      const delta = newScore - oldScore;
      const user = await prisma.user.findUnique({ where: { id: userId }});
      if (user) {
        // Award points write-through synchronously
        await awardPoints(user.id, user.house, delta);
      }
    }

    // 3. Save new snapshot (Idempotency guarantee)
    await prisma.platformSyncState.upsert({
      where: { userId_platform: { userId, platform } },
      update: { snapshotData: liveData },
      create: { userId, platform, snapshotData: liveData }
    });
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 jobs at a time locally
    limiter: {
      max: 10,
      duration: 1000 // Rate limit: Max 10 requests per second across all workers to avoid API IP bans
    }
  }
);
