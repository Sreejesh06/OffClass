import { redis } from "./redis.js";
import { prisma } from "./db.js";
import type { House } from "@prisma/client";

export const getOverallKey = (): string => "leaderboard:overall";
export const getHouseKey = (house: House): string => `leaderboard:house:${house}`;

/**
 * Safely awards points to a user via a write-through strategy.
 * Postgres is incremented securely as the absolute source of truth.
 * The resulting total is then synchronously pipeline-written to Redis.
 */
export const awardPoints = async (userId: string, house: House, pointsToAdd: number): Promise<number> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: pointsToAdd } },
  });

  const newTotal = user.points;

  // Use a pipeline to write to both sorted sets cleanly in one round trip
  const pipeline = redis.pipeline();
  pipeline.zadd(getOverallKey(), newTotal, userId);
  pipeline.zadd(getHouseKey(house), newTotal, userId);
  await pipeline.exec();

  return newTotal;
};

/**
 * Retrieves the top X users from either the overall or house-specific leaderboard.
 * Results are mapped from the flat array (WITHSCORES) into a structured format.
 */
export const getTopUsers = async (
  house?: House,
  limit: number = 50
): Promise<Array<{ userId: string; points: number; rank: number }>> => {
  const key = house ? getHouseKey(house) : getOverallKey();
  
  // ZREVRANGE returns [userId1, score1, userId2, score2, ...]
  const results = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
  
  const formatted = [];
  for (let i = 0; i < results.length; i += 2) {
    formatted.push({
      userId: results[i]!,
      points: parseInt(results[i + 1]!, 10),
      rank: Math.floor(i / 2) + 1, // Convert 0-indexed to 1-indexed human rank
    });
  }
  
  return formatted;
};

/**
 * Returns a single user's rank (1-indexed).
 * Returns null if the user is unranked (e.g., they have 0 points and aren't in the set).
 */
export const getUserRank = async (userId: string, house?: House): Promise<number | null> => {
  const key = house ? getHouseKey(house) : getOverallKey();
  const rank = await redis.zrevrank(key, userId);
  
  return rank !== null ? rank + 1 : null;
};
