import { redis } from "./redis.js";
import crypto from "crypto";

// PoW difficulty: The hash must start with 5 zeros in hex
const DIFFICULTY = "00000";

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
  if (!hash.startsWith(DIFFICULTY)) return false;

  // 3. Mark the seed as used by deleting it (single-use guarantee)
  await redis.del(`pow:${seed}`);
  return true;
};
