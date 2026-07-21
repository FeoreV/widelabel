import { Redis } from "ioredis";
export declare const UNLOCK_LUA_SCRIPT = "\nif redis.call('get', KEYS[1]) == ARGV[1] then\n  return redis.call('del', KEYS[1])\nelse\n  return 0\nend\n";
export interface LockResult {
    acquired: boolean;
    key: string;
    token: string;
}
export declare class RedisLockService {
    private redisClient;
    constructor(redisClient: Redis);
    acquireLock(resourceKey: string, ttlMs: number, token?: string): Promise<LockResult>;
    releaseLock(resourceKey: string, token: string): Promise<boolean>;
    withLock<T>(resourceKey: string, ttlMs: number, fn: () => Promise<T>): Promise<T>;
}
