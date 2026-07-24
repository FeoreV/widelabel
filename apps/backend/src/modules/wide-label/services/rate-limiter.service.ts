import type { Redis } from "ioredis";

export type RateLimitEndpoint = "hold" | "waitlist" | "webhook" | "pvz";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const ENDPOINT_LIMIT_CONFIGS: Record<RateLimitEndpoint, RateLimitConfig> = {
  hold: { maxRequests: 10, windowSeconds: 60 },
  waitlist: { maxRequests: 5, windowSeconds: 60 },
  webhook: { maxRequests: 300, windowSeconds: 60 },
  pvz: { maxRequests: 30, windowSeconds: 60 },
};

export class RateLimitExceededError extends Error {
  public code = "RATE_LIMIT_EXCEEDED";
  public retryAfterSeconds: number;

  constructor(endpoint: RateLimitEndpoint, retryAfterSeconds: number) {
    super(`Rate limit exceeded for endpoint '${endpoint}'. Retry after ${retryAfterSeconds}s`);
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RateLimiterService {
  private requestTimestamps = new Map<string, number[]>();
  private redisClient?: Redis;

  constructor(redisClient?: Redis) {
    this.redisClient = redisClient;
  }

  public checkLimit(
    endpoint: RateLimitEndpoint,
    clientIdentifier: string,
    nowMs: number = Date.now()
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const config = ENDPOINT_LIMIT_CONFIGS[endpoint];
    const windowMs = config.windowSeconds * 1000;
    const key = `${endpoint}:${clientIdentifier}`;

    const timestamps = this.requestTimestamps.get(key) || [];
    const validTimestamps = timestamps.filter((t) => nowMs - t < windowMs);

    if (validTimestamps.length >= config.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestTimestamp + windowMs - nowMs) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    validTimestamps.push(nowMs);
    this.requestTimestamps.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: config.maxRequests - validTimestamps.length,
      retryAfterSeconds: 0,
    };
  }

  public async checkLimitAsync(
    endpoint: RateLimitEndpoint,
    clientIdentifier: string,
    nowMs: number = Date.now()
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    if (!this.redisClient) {
      return this.checkLimit(endpoint, clientIdentifier, nowMs);
    }

    const config = ENDPOINT_LIMIT_CONFIGS[endpoint];
    const windowMs = config.windowSeconds * 1000;
    const key = `ratelimit:${endpoint}:${clientIdentifier}`;
    const clearBefore = nowMs - windowMs;

    try {
      await this.redisClient.zremrangebyscore(key, 0, clearBefore);
      const count = await this.redisClient.zcard(key);

      if (count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: config.windowSeconds,
        };
      }

      await this.redisClient.zadd(key, nowMs, `${nowMs}-${Math.random()}`);
      await this.redisClient.expire(key, config.windowSeconds);

      return {
        allowed: true,
        remaining: config.maxRequests - (count + 1),
        retryAfterSeconds: 0,
      };
    } catch {
      return this.checkLimit(endpoint, clientIdentifier, nowMs);
    }
  }

  public consume(endpoint: RateLimitEndpoint, clientIdentifier: string, nowMs: number = Date.now()): void {
    const res = this.checkLimit(endpoint, clientIdentifier, nowMs);
    if (!res.allowed) {
      throw new RateLimitExceededError(endpoint, res.retryAfterSeconds);
    }
  }
}
