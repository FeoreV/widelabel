export type RateLimitEndpoint = "hold" | "waitlist" | "webhook" | "pvz";
export interface RateLimitConfig {
    maxRequests: number;
    windowSeconds: number;
}
export declare const ENDPOINT_LIMIT_CONFIGS: Record<RateLimitEndpoint, RateLimitConfig>;
export declare class RateLimitExceededError extends Error {
    code: string;
    retryAfterSeconds: number;
    constructor(endpoint: RateLimitEndpoint, retryAfterSeconds: number);
}
export declare class RateLimiterService {
    private requestTimestamps;
    checkLimit(endpoint: RateLimitEndpoint, clientIdentifier: string, nowMs?: number): {
        allowed: boolean;
        remaining: number;
        retryAfterSeconds: number;
    };
    consume(endpoint: RateLimitEndpoint, clientIdentifier: string, nowMs?: number): void;
}
