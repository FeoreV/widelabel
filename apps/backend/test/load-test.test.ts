import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { reserveVariantWorkflow, ItemHeldError } from "../src/workflows/reserve-variant.ts";

test("Load Test: High-concurrency 1-of-1 inventory drop holds (500 concurrent requests)", async () => {
  const repo = new InMemoryReservationRepository();
  const CONCURRENT_REQUESTS = 500;
  const variantId = "var_loadtest_01";

  const startMs = Date.now();
  const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
    reserveVariantWorkflow(repo, {
      variant_id: variantId,
      cart_id: `cart_loadtest_${i}`,
    })
      .then((res) => ({ status: "fulfilled" as const, value: res }))
      .catch((err) => ({ status: "rejected" as const, reason: err }))
  );

  const results = await Promise.all(promises);
  const durationMs = Date.now() - startMs;

  const winners = results.filter((r) => r.status === "fulfilled");
  const rejections = results.filter((r) => r.status === "rejected");

  assert.strictEqual(winners.length, 1, "Exactly 1 winner MUST acquire the 1-of-1 item hold");
  assert.strictEqual(rejections.length, CONCURRENT_REQUESTS - 1, "All other 499 requests MUST be rejected");

  for (const r of rejections) {
    if (r.status === "rejected") {
      assert.ok(
        r.reason instanceof ItemHeldError || r.reason.message?.includes("already exists"),
        "Rejection reason must indicate item is held"
      );
    }
  }

  const rps = Math.round((CONCURRENT_REQUESTS / durationMs) * 1000);
  assert.ok(rps > 0);
  console.log(`[Load Test Benchmark] Processed ${CONCURRENT_REQUESTS} concurrent hold requests in ${durationMs}ms (${rps} req/sec)`);
});
