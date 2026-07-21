import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";

test("Spike: Inventory reservation transaction boundary guarantees 1-of-1 atomic hold", async () => {
  const repo = new InMemoryReservationRepository();
  const variantId = "var_spike_01";
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // First reservation attempt
  const res1 = await repo.create({
    variant_id: variantId,
    cart_id: "cart_A",
    expires_at: expiresAt,
  });

  assert.ok(res1.id);
  assert.strictEqual(res1.status, "active");

  // Concurrent second reservation attempt on same variant MUST fail transaction boundary
  let failed = false;
  try {
    await repo.create({
      variant_id: variantId,
      cart_id: "cart_B",
      expires_at: expiresAt,
    });
  } catch (err: any) {
    failed = true;
    assert.match(err.message, /Open reservation already exists/);
  }

  assert.strictEqual(failed, true, "Second reservation attempt on 1-of-1 variant must fail");
});
