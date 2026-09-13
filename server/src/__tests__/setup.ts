import "dotenv/config";
import { beforeAll, beforeEach, afterAll } from "vitest";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";

// We execute this before any tests run
beforeAll(async () => {
  // Ensure the Prisma schema is up to date in the DB.
  // In a real CI this would be `prisma migrate deploy` or `prisma db push`
  // Since we are relying on the dev DB right now, we assume it's pushed.
});

// Clean slate before EVERY test
beforeEach(async () => {
  // Clear redis
  await redis.flushdb();

  // Fast truncate of all tables except Prisma migrations.
  // CASCADE handles foreign key dependencies.
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';`;

  if (tables.length > 0) {
    const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
  }
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
  redis.disconnect();
});
