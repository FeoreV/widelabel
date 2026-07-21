import assert from "node:assert";
import test from "node:test";
import { RedisLockService, UNLOCK_LUA_SCRIPT } from "./lock.ts";

function createMockRedis() {
  const store = new Map<string, string>();

  return {
    async set(key: string, val: string, _px: string, _ttl: number, _nx: string) {
      if (store.has(key)) {
        return null;
      }
      store.set(key, val);
      return "OK";
    },
    async eval(script: string, _keyCount: number, key: string, token: string) {
      assert.strictEqual(script, UNLOCK_LUA_SCRIPT);
      if (store.get(key) === token) {
        store.delete(key);
        return 1;
      }
      return 0;
    },
    get(key: string) {
      return store.get(key);
    },
  };
}

test("RedisLockService acquires and releases lock with correct token", async () => {
  const mockRedis = createMockRedis();
  const lockService = new RedisLockService(mockRedis as any);

  const lock = await lockService.acquireLock("variant_123", 10000, "token_abc");
  assert.strictEqual(lock.acquired, true);
  assert.strictEqual(lock.token, "token_abc");

  // Attempting to acquire again with different token fails
  const secondAttempt = await lockService.acquireLock("variant_123", 10000, "token_xyz");
  assert.strictEqual(secondAttempt.acquired, false);

  // Releasing with wrong token fails
  const wrongRelease = await lockService.releaseLock("variant_123", "wrong_token");
  assert.strictEqual(wrongRelease, false);

  // Releasing with correct token succeeds
  const rightRelease = await lockService.releaseLock("variant_123", "token_abc");
  assert.strictEqual(rightRelease, true);
});

test("RedisLockService withLock executes function and releases lock", async () => {
  const mockRedis = createMockRedis();
  const lockService = new RedisLockService(mockRedis as any);

  let executed = false;
  const result = await lockService.withLock("variant_456", 5000, async () => {
    executed = true;
    return "result_value";
  });

  assert.strictEqual(executed, true);
  assert.strictEqual(result, "result_value");
  assert.strictEqual(mockRedis.get("lock:variant_456"), undefined);
});
