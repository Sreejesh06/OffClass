import { Worker, type Job } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/db.js";
import { awardPoints } from "../lib/leaderboard.js";
import type { SyncJobData } from "../lib/queue.js";
import { QUEUE_CONFIGS } from "../lib/queue.js";

import { fetchCodeforces, parseCodeforces } from "../lib/platforms/codeforces.js";
import { fetchLeetCode, parseLeetCode } from "../lib/platforms/leetcode.js";
import { fetchGfg, parseGfg } from "../lib/platforms/gfg.js";
import { fetchThm, parseThm } from "../lib/platforms/thm.js";
import { fetchHtb, parseHtb } from "../lib/platforms/htb.js";

type FetchFn = (handle: string) => Promise<any>;
type ParseFn = (raw: any) => Record<string, number | string>;

const FETCHERS: Partial<Record<string, FetchFn>> = {
  codeforces: fetchCodeforces,
  leetcode: fetchLeetCode,
  gfg: fetchGfg,
  thm: fetchThm,
  htb: fetchHtb,
};

const PARSERS: Partial<Record<string, ParseFn>> = {
  codeforces: parseCodeforces,
  leetcode: parseLeetCode,
  gfg: parseGfg,
  thm: parseThm,
  htb: parseHtb,
};

const SCORE_KEYS: Record<string, string> = {
  codeforces: "solvedCount",
  leetcode: "totalSolved",
  gfg: "totalProblemsSolved",
  thm: "points",
  htb: "points",
};

const processSyncJob = async (job: Job<SyncJobData>) => {
  const { userId, provider, handle } = job.data;
  const key = provider.toLowerCase();

  const fetchFn = FETCHERS[key];
  const parseFn = PARSERS[key];
  if (!fetchFn || !parseFn) {
    throw new Error(`No fetcher/parser registered for provider: ${provider}`);
  }

  try {
    const rawSnapshot = await fetchFn(handle);
    const parsedStats = parseFn(rawSnapshot);

    // Diff against previous sync for point delta
    const prevSync = await prisma.profileSync.findUnique({
      where: { userId_provider: { userId, provider } },
    });

    const scoreKey = SCORE_KEYS[key] ?? "points";
    const oldScore = Number((prevSync?.parsedStats as any)?.[scoreKey] ?? 0);
    const newScore = Number(parsedStats[scoreKey] ?? 0);

    if (newScore > oldScore) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await awardPoints(user.id, user.house, newScore - oldScore);
      }
    }

    // Upsert the sync record with raw + parsed data
    await prisma.profileSync.upsert({
      where: { userId_provider: { userId, provider } },
      update: {
        rawSnapshot: rawSnapshot as any,
        parsedStats: parsedStats as any,
        lastSyncedAt: new Date(),
        lastError: null,
        status: "SYNCED",
      },
      create: {
        userId,
        provider,
        rawSnapshot: rawSnapshot as any,
        parsedStats: parsedStats as any,
        status: "SYNCED",
      },
    });

    // Mark the profile link as verified on first successful sync
    await prisma.profileLink.updateMany({
      where: { userId, provider, verified: false },
      data: { verified: true },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown sync error";
    // Write error, leave previous snapshot untouched
    await prisma.profileSync.upsert({
      where: { userId_provider: { userId, provider } },
      update: { lastError: message, status: "FAILED" },
      create: {
        userId,
        provider,
        rawSnapshot: {},
        parsedStats: {},
        lastError: message,
        status: "FAILED",
      },
    });
    throw err; // Re-throw so BullMQ handles retry
  }
};

// Boot one Worker per platform queue
for (const [name, config] of Object.entries(QUEUE_CONFIGS)) {
  new Worker<SyncJobData>(
    `sync:${name}`,
    processSyncJob,
    {
      connection: redis,
      concurrency: config.concurrency,
      limiter: { max: config.rateMax, duration: config.rateDuration },
    }
  );
}
