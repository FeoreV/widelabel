import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { reserveVariantWorkflow, ItemHeldError } from "../src/modules/wide-label/domain-workflows/reserve-variant.ts";
import { getPgPool, closePgPool } from "../src/infra/db.ts";

test("P0-B Integration: Real PostgreSQL & Redis Concurrency Race for 1-of-1 Item", async () => {
  const pool = getPgPool();
  const repo = new PostgresReservationRepository(pool);

  const variantId = `var_race_real_${Date.now()}`;
  const cartA = `cart_race_a_${Date.now()}`;
  const cartB = `cart_race_b_${Date.now()}`;
  const now = new Date();

  // Concurrent hold attempt for cart A and cart B
  const results = await Promise.allSettled([
    reserveVariantWorkflow(repo, { variant_id: variantId, cart_id: cartA }, now),
    reserveVariantWorkflow(repo, { variant_id: variantId, cart_id: cartB }, now),
  ]);

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  assert.strictEqual(fulfilled.length, 1, "Exactly one request must succeed");
  assert.strictEqual(rejected.length, 1, "Exactly one request must be rejected");

  const winner = (fulfilled[0] as PromiseFulfilledResult<any>).value;
  assert.ok(winner.id);
  assert.strictEqual(winner.variant_id, variantId);

  const loserErr = (rejected[0] as PromiseRejectedResult).reason;
  assert.ok(
    loserErr instanceof ItemHeldError ||
      loserErr?.code === "ITEM_HELD" ||
      loserErr?.code === "23505" ||
      loserErr?.message?.includes("ITEM_HELD"),
    `Loser error must indicate item held or duplicate key violation, got: ${loserErr}`
  );

  // Verify PostgreSQL partial unique index enforces single open reservation
  const openReservation = await repo.findOpenByVariant(variantId, now);
  assert.ok(openReservation);
  assert.strictEqual(openReservation.id, winner.id);
});

test("P0-B Integration: Direct PostgreSQL Partial Unique Index Violation Enforcement", async () => {
  const pool = getPgPool();
  const repo = new PostgresReservationRepository(pool);
  const variantId = `var_uq_index_${Date.now()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  // First open reservation
  const res1 = await repo.create({
    variant_id: variantId,
    cart_id: "cart_direct_1",
    status: "active",
    expires_at: expiresAt,
  }, now);
  assert.ok(res1.id);

  // Direct insert of second active reservation on same variant MUST fail at database level
  await assert.rejects(
    async () =>
      repo.create({
        variant_id: variantId,
        cart_id: "cart_direct_2",
        status: "active",
        expires_at: expiresAt,
      }, now),
    (err: any) => err.code === "23505" || err.message?.includes("uq_wl_one_open_reservation_per_variant")
  );

  await closePgPool();
});

test.after(async () => {
  await closePgPool();
});

