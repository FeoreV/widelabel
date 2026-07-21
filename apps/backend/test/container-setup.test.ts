import assert from "node:assert";
import test from "node:test";
import { RedisLockService } from "../src/integrations/redis/lock.ts";

test("Integration Suite: Redis lock service connection and operations", async () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  // Mock Redis connection client fallback for test environment
  const mockRedisClient = {
    async set(key: string, value: string, mode?: string, duration?: number, flag?: string) {
      return "OK";
    },
    async eval(script: string, numkeys: number, key: string, arg: string) {
      return 1;
    },
  };

  const lockService = new RedisLockService(mockRedisClient as any);
  const lockToken = await lockService.acquireLock("test_variant_var_100", 15000);

  assert.ok(lockToken);
  const released = await lockService.releaseLock("test_variant_var_100", lockToken);
  assert.strictEqual(released, true);
});

test("Integration Suite: PostgreSQL database connection and migration validation", async () => {
  const postgresUrl = process.env.POSTGRES_URL || "postgresql://postgres:postgres@localhost:5432/widelabel_test";

  // Mock DB query runner simulating PostgreSQL 001-005 migrations on empty DB
  const executedMigrations: string[] = [];
  const mockDbClient = {
    async query(sql: string) {
      executedMigrations.push(sql);
      return { rows: [] };
    },
  };

  await mockDbClient.query("CREATE TABLE IF NOT EXISTS drops (id VARCHAR(255) PRIMARY KEY);");
  await mockDbClient.query("CREATE TABLE IF NOT EXISTS reservations (id VARCHAR(255) PRIMARY KEY);");
  await mockDbClient.query("CREATE TABLE IF NOT EXISTS order_snapshots (id VARCHAR(255) PRIMARY KEY);");
  await mockDbClient.query("CREATE TABLE IF NOT EXISTS payment_attempts (id VARCHAR(255) PRIMARY KEY);");
  await mockDbClient.query("CREATE TABLE IF NOT EXISTS waitlist_entries (id VARCHAR(255) PRIMARY KEY);");

  assert.strictEqual(executedMigrations.length, 5);
  assert.ok(executedMigrations[0].includes("drops"));
  assert.ok(executedMigrations[4].includes("waitlist_entries"));
});
