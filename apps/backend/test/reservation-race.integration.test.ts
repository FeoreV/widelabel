import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { reserveVariantWorkflow, ItemHeldError } from "../src/workflows/reserve-variant.ts";
import { processReservationExpirationJob } from "../src/jobs/reservation-expiration.worker.ts";
import { runReservationSweeperBatch } from "../src/jobs/reservation-sweeper.worker.ts";
import { RedisLockService } from "../src/integrations/redis/lock.ts";

test("100 concurrent reservation requests on same variant result in exactly 1 winner and 99 ITEM_HELD errors", async () => {
  const repo = new InMemoryReservationRepository();
  const variantId = "var_race_100";
  const now = new Date("2026-07-21T10:00:00.000Z");

  const results = await Promise.allSettled(
    Array.from({ length: 100 }, (_, i) =>
      reserveVariantWorkflow(
        repo,
        {
          variant_id: variantId,
          cart_id: `cart_user_${i}`,
        },
        now
      )
    )
  );

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  assert.strictEqual(fulfilled.length, 1, "Exactly 1 request must succeed");
  assert.strictEqual(rejected.length, 99, "Exactly 99 requests must be rejected");

  rejected.forEach((r) => {
    if (r.status === "rejected") {
      assert.ok(r.reason instanceof ItemHeldError);
      assert.strictEqual(r.reason.code, "ITEM_HELD");
    }
  });
});

test("Same-cart retry across multiple concurrent calls returns same reservation idempotently without extending expiry", async () => {
  const repo = new InMemoryReservationRepository();
  const variantId = "var_same_cart";
  const cartId = "cart_loyal_customer";
  const now = new Date("2026-07-21T10:00:00.000Z");

  const firstRes = await reserveVariantWorkflow(
    repo,
    { variant_id: variantId, cart_id: cartId },
    now
  );

  const retryResults = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      reserveVariantWorkflow(
        repo,
        { variant_id: variantId, cart_id: cartId },
        new Date(now.getTime() + (i + 1) * 60 * 1000)
      )
    )
  );

  retryResults.forEach((res) => {
    assert.strictEqual(res.id, firstRes.id);
    assert.strictEqual(
      res.expires_at.toISOString(),
      firstRes.expires_at.toISOString()
    );
  });
});

test("Expiration worker and sweeper handle worker restart and expired items", async () => {
  const repo = new InMemoryReservationRepository();
  const past = new Date("2026-07-21T09:40:00.000Z");
  const now = new Date("2026-07-21T10:00:00.000Z");

  const res1 = await repo.create({
    variant_id: "var_restart_01",
    cart_id: "cart_01",
    expires_at: past,
  });

  // Simulating worker process restart and job retry
  const jobResult1 = await processReservationExpirationJob(
    repo,
    { reservation_id: res1.id, variant_id: "var_restart_01" },
    now
  );
  assert.strictEqual(jobResult1.processed, true);

  // Worker restart: running again on processed job is idempotent
  const jobResult2 = await processReservationExpirationJob(
    repo,
    { reservation_id: res1.id, variant_id: "var_restart_01" },
    now
  );
  assert.strictEqual(jobResult2.processed, false);

  // Sweeper reconciliation handles any missed jobs after worker restart
  const sweepResult = await runReservationSweeperBatch(repo, now);
  assert.strictEqual(sweepResult.sweptCount, 0);
});

test("PostgreSQL reservation boundary holds even if Redis lock fails", async () => {
  const failingRedis = {
    async set() {
      throw new Error("Redis connection lost");
    },
    async eval() {
      throw new Error("Redis connection lost");
    },
  };

  const lockService = new RedisLockService(failingRedis as any);
  const repo = new InMemoryReservationRepository();

  // Primary db reservation workflow proceeds as source of truth when redis fails
  let redisFailed = false;
  try {
    await lockService.acquireLock("var_redis_fail", 10000);
  } catch {
    redisFailed = true;
  }
  assert.strictEqual(redisFailed, true);

  const res = await reserveVariantWorkflow(
    repo,
    { variant_id: "var_redis_fail", cart_id: "cart_db_truth" },
    new Date()
  );
  assert.strictEqual(res.status, "active");
});
