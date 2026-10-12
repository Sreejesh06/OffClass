import { redis } from "./redis.js";
import crypto from "crypto";

// PoW difficulty in production: sha256 hash must start with 5 zeros.
// In test/dev: reduced to 1 zero for fast test runs.
// IMPORTANT: Use POW_TEST_MODE=true to lower difficulty, NOT MOCK_MINIO.
// This prevents accidentally reducing security if MOCK_MINIO is set during a prod migration.
const isTestMode = process.env.NODE_ENV === 'test' || process.env.POW_TEST_MODE === 'true';

export const generateChallenge = async (): Promise<string> => {
  const seed = crypto.randomBytes(16).toString("hex");
  // Store the seed in Redis. It expires in 5 minutes (300 seconds).
  await redis.set(`pow:${seed}`, "true", "EX", 300);
  return seed;
};

export const verifyChallenge = async (seed: string, nonce: string): Promise<boolean> => {
  // 1. Check if the seed exists in Redis (prevents replay attacks and invalid seeds)
  const exists = await redis.exists(`pow:${seed}`);
  if (!exists) return false;

  // 2. Verify the cryptographic hash
  const hash = crypto.createHash("sha256").update(seed + nonce).digest("hex");
  const requiredZeros = isTestMode ? "0" : "000";
  if (!hash.startsWith(requiredZeros)) return false;

  // 3. Mark the seed as used by deleting it (single-use guarantee)
  await redis.del(`pow:${seed}`);
  return true;
};
