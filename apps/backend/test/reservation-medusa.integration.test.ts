import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { reserveVariantWorkflow, ItemHeldError } from "../src/modules/wide-label/domain-workflows/reserve-variant.ts";
import { handleCartLineRemoved } from "../src/subscribers/cart-line-removed.ts";
import { getPgPool, closePgPool } from "../src/infra/db.ts";

test("P0-A Integration: real PostgreSQL reservation lifecycle and 1-of-1 invariant", async () => {
  const pool = getPgPool();
  const repo = new PostgresReservationRepository(pool);

  const variantId = `var_real_pg_${Date.now()}`;
  const cartA = `cart_real_a_${Date.now()}`;
  const cartB = `cart_real_b_${Date.now()}`;
  const now = new Date();

  // 1. Hold for Cart A
  const resA = await reserveVariantWorkflow(repo, { variant_id: variantId, cart_id: cartA }, now);
  assert.ok(resA.id);
  assert.strictEqual(resA.variant_id, variantId);
  assert.strictEqual(resA.cart_id, cartA);
  assert.strictEqual(resA.status, "active");
  assert.ok(resA.expires_at > now);

  // 2. Verify row persisted in real PostgreSQL
  const dbRow = await repo.findById(resA.id);
  assert.ok(dbRow);
  assert.strictEqual(dbRow.cart_id, cartA);

  // 3. Attempt Hold for Cart B -> Must fail with ITEM_HELD
  await assert.rejects(
    async () => reserveVariantWorkflow(repo, { variant_id: variantId, cart_id: cartB }, now),
    (err: any) => err instanceof ItemHeldError && err.code === "ITEM_HELD"
  );

  // Verify only 1 open reservation in PostgreSQL
  const openRes = await repo.findOpenByVariant(variantId, now);
  assert.strictEqual(openRes?.id, resA.id);

  // 4. Same-cart retry -> Must return same reservation idempotently without extending expiry
  const retryRes = await reserveVariantWorkflow(repo, { variant_id: variantId, cart_id: cartA }, new Date(now.getTime() + 60000));
  assert.strictEqual(retryRes.id, resA.id);
  assert.strictEqual(retryRes.expires_at.toISOString(), resA.expires_at.toISOString());

  // 5. Line removal -> Release reservation immediately
  const released = await handleCartLineRemoved(repo, { cart_id: cartA, variant_id: variantId }, new Date());
  assert.strictEqual(released, true);

  const afterRelease = await repo.findById(resA.id);
  assert.strictEqual(afterRelease?.status, "released");

  // 6. Repeated removal is idempotent
  const repeatRelease = await handleCartLineRemoved(repo, { cart_id: cartA, variant_id: variantId }, new Date());
  assert.strictEqual(repeatRelease, false);

  await closePgPool();
});

test.after(async () => {
  await closePgPool();
});

