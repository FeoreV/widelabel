import assert from "node:assert";
import test from "node:test";
import {
  RateLimiterService,
  RateLimitExceededError,
} from "./rate-limiter.service.ts";

test("RateLimiterService enforces limits on hold endpoint (10 req/60s)", () => {
  const service = new RateLimiterService();
  const ip = "192.168.1.50";
  const startMs = Date.now();

  for (let i = 0; i < 10; i++) {
    const res = service.checkLimit("hold", ip, startMs);
    assert.strictEqual(res.allowed, true);
  }

  const overflow = service.checkLimit("hold", ip, startMs);
  assert.strictEqual(overflow.allowed, false);
  assert.ok(overflow.retryAfterSeconds > 0);

  assert.throws(
    () => service.consume("hold", ip, startMs),
    RateLimitExceededError
  );
});

test("RateLimiterService resets limit after window expiration", () => {
  const service = new RateLimiterService();
  const ip = "10.0.0.1";
  const startMs = 1000000;

  for (let i = 0; i < 5; i++) {
    service.consume("waitlist", ip, startMs);
  }

  // Next request in same window fails
  assert.throws(
    () => service.consume("waitlist", ip, startMs + 1000),
    RateLimitExceededError
  );

  // Request after 61 seconds succeeds
  const futureMs = startMs + 61000;
  const res = service.checkLimit("waitlist", ip, futureMs);
  assert.strictEqual(res.allowed, true);
});

test("RateLimiterService supports separate limits for pvz and webhook endpoints", () => {
  const service = new RateLimiterService();
  const ip = "1.2.3.4";
  const now = Date.now();

  // PVZ max 30
  for (let i = 0; i < 30; i++) {
    assert.strictEqual(service.checkLimit("pvz", ip, now).allowed, true);
  }
  assert.strictEqual(service.checkLimit("pvz", ip, now).allowed, false);

  // Webhook max 300
  for (let i = 0; i < 300; i++) {
    assert.strictEqual(service.checkLimit("webhook", ip, now).allowed, true);
  }
  assert.strictEqual(service.checkLimit("webhook", ip, now).allowed, false);
});
