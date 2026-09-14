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
export const awardPoints = async (
  userId: string, 
  house: House, 
  pointsToAdd: number,
  reason: string = "Manual adjustment",
  referenceType?: string,
  referenceId?: string,
  createdBy?: string
): Promise<number> => {
  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsToAdd } },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId,
        delta: pointsToAdd,
        reason,
        referenceType,
        referenceId,
        createdBy
      }
    })
  ]);

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
): Promise<Array<{ id: string; name: string; house: House; points: number; rank: number; previousRank: number }>> => {
  const key = house ? getHouseKey(house) : getOverallKey();
  
  // ZREVRANGE returns [userId1, score1, userId2, score2, ...]
  const results = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
  
  if (results.length === 0) return [];

  const rawUsers = [];
  const userIds = [];
  for (let i = 0; i < results.length; i += 2) {
    const userId = results[i]!;
    userIds.push(userId);
    rawUsers.push({
      userId,
      points: parseInt(results[i + 1]!, 10),
      rank: Math.floor(i / 2) + 1, // Convert 0-indexed to 1-indexed human rank
    });
  }

  // Fetch the user details from DB
  const usersDb = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, house: true }
  });

  // Create a fast lookup map
  const userMap = new Map(usersDb.map(u => [u.id, u]));

  // Also fetch previous ranks from the snapshot logic (optional, stub to rank for now)
  // To keep it fast, we can just stub previousRank to rank (meaning no change) if we don't have historic data loaded.
  
  return rawUsers
    .map(ru => {
      const dbUser = userMap.get(ru.userId);
      if (!dbUser) return null;
      return {
        id: dbUser.id,
        name: dbUser.name,
        house: dbUser.house,
        points: ru.points,
        rank: ru.rank,
        previousRank: ru.rank // Stubbed for now, normally would query `LeaderboardSnapshot`
      };
    })
    .filter((u): u is NonNullable<typeof u> => u !== null);
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

/**
 * Atomically transfers a user's leaderboard score from one house to another.
 */
export const transferHouseLeaderboard = async (
  userId: string,
  oldHouse: House,
  newHouse: House,
  points: number
): Promise<void> => {
  const pipeline = redis.pipeline();
  pipeline.zrem(getHouseKey(oldHouse), userId);
  pipeline.zadd(getHouseKey(newHouse), points, userId);
  await pipeline.exec();
};

