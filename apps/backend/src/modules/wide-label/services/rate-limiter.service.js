export const ENDPOINT_LIMIT_CONFIGS = {
    hold: { maxRequests: 10, windowSeconds: 60 },
    waitlist: { maxRequests: 5, windowSeconds: 60 },
    webhook: { maxRequests: 300, windowSeconds: 60 },
    pvz: { maxRequests: 30, windowSeconds: 60 },
};
export class RateLimitExceededError extends Error {
    code = "RATE_LIMIT_EXCEEDED";
    retryAfterSeconds;
    constructor(endpoint, retryAfterSeconds) {
        super(`Rate limit exceeded for endpoint '${endpoint}'. Retry after ${retryAfterSeconds}s`);
        this.name = "RateLimitExceededError";
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
export class RateLimiterService {
    // Key format: `${endpoint}:${clientIdentifier}` -> array of request timestamps (ms)
    requestTimestamps = new Map();
    checkLimit(endpoint, clientIdentifier, nowMs = Date.now()) {
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
    consume(endpoint, clientIdentifier, nowMs = Date.now()) {
        const res = this.checkLimit(endpoint, clientIdentifier, nowMs);
        if (!res.allowed) {
            throw new RateLimitExceededError(endpoint, res.retryAfterSeconds);
        }
    }
}
