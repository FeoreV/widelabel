import { randomUUID } from "node:crypto";
export const UNLOCK_LUA_SCRIPT = `
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
`;
export class RedisLockService {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async acquireLock(resourceKey, ttlMs, token = randomUUID()) {
        const key = `lock:${resourceKey}`;
        const result = await this.redisClient.set(key, token, "PX", ttlMs, "NX");
        const acquired = result === "OK";
        return {
            acquired,
            key,
            token,
        };
    }
    async releaseLock(resourceKey, token) {
        const key = resourceKey.startsWith("lock:")
            ? resourceKey
            : `lock:${resourceKey}`;
        const result = await this.redisClient.eval(UNLOCK_LUA_SCRIPT, 1, key, token);
        return result === 1;
    }
    async withLock(resourceKey, ttlMs, fn) {
        const lock = await this.acquireLock(resourceKey, ttlMs);
        if (!lock.acquired) {
            throw new Error(`Failed to acquire lock for resource '${resourceKey}'`);
        }
        try {
            return await fn();
        }
        finally {
            await this.releaseLock(lock.key, lock.token);
        }
    }
}
