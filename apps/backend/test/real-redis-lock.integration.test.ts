import assert from "node:assert";
import test from "node:test";
import Redis from "ioredis";
import { RedisLockService } from "../src/integrations/redis/lock.ts";

test("P0-4 Integration: Real Redis Lock acquires, releases, and enforces owner isolation", async () => {
  const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
  const lockService = new RedisLockService(redis);

  const resource = `res_real_lock_${Date.now()}`;
  const tokenA = "owner_token_a";
  const tokenB = "non_owner_token_b";

  // 1. Owner A acquires lock
  const lockA = await lockService.acquireLock(resource, 5000, tokenA);
  assert.strictEqual(lockA.acquired, true);
  assert.strictEqual(lockA.token, tokenA);

  // 2. Owner B tries to acquire same lock -> fails
  const lockB = await lockService.acquireLock(resource, 5000, tokenB);
  assert.strictEqual(lockB.acquired, false);

  // 3. Non-owner B attempts release -> fails via Lua compare-and-delete
  const releaseB = await lockService.releaseLock(resource, tokenB);
  assert.strictEqual(releaseB, false);

  // Lock still held in Redis
  const rawValue = await redis.get(`lock:${resource}`);
  assert.strictEqual(rawValue, tokenA);

  // 4. Owner A releases lock -> succeeds
  const releaseA = await lockService.releaseLock(resource, tokenA);
  assert.strictEqual(releaseA, true);

  const afterRelease = await redis.get(`lock:${resource}`);
  assert.strictEqual(afterRelease, null);

  // 5. withLock releases lock in finally block even when function throws
  const resourceThrow = `res_throw_${Date.now()}`;
  await assert.rejects(
    async () =>
      lockService.withLock(resourceThrow, 5000, async () => {
        throw new Error("Operation failed inside lock");
      }),
    /Operation failed inside lock/
  );

  const afterThrow = await redis.get(`lock:${resourceThrow}`);
  assert.strictEqual(afterThrow, null);

  await redis.quit();
});
