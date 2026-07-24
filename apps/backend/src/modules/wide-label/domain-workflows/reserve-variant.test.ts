import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../repositories/reservation-repository.ts";
import { reserveVariantWorkflow, ItemHeldError } from "./reserve-variant.ts";

test("reserveVariantWorkflow creates new active reservation when available", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date("2026-07-21T10:00:00.000Z");

  const reservation = await reserveVariantWorkflow(
    repo,
    { variant_id: "var_01", cart_id: "cart_01" },
    now
  );

  assert.strictEqual(reservation.variant_id, "var_01");
  assert.strictEqual(reservation.cart_id, "cart_01");
  assert.strictEqual(reservation.status, "active");
  assert.strictEqual(
    reservation.expires_at.toISOString(),
    "2026-07-21T10:15:00.000Z"
  );
});

test("reserveVariantWorkflow same-cart retry is idempotent and does not extend expiry", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date("2026-07-21T10:00:00.000Z");

  const firstCall = await reserveVariantWorkflow(
    repo,
    { variant_id: "var_02", cart_id: "cart_01" },
    now
  );

  const laterTime = new Date("2026-07-21T10:05:00.000Z");
  const secondCall = await reserveVariantWorkflow(
    repo,
    { variant_id: "var_02", cart_id: "cart_01" },
    laterTime
  );

  assert.strictEqual(secondCall.id, firstCall.id);
  assert.strictEqual(
    secondCall.expires_at.toISOString(),
    "2026-07-21T10:15:00.000Z",
    "Expiry MUST NOT be extended on same-cart retry"
  );
});

test("reserveVariantWorkflow throws ItemHeldError for another cart", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date("2026-07-21T10:00:00.000Z");

  await reserveVariantWorkflow(
    repo,
    { variant_id: "var_03", cart_id: "cart_01" },
    now
  );

  await assert.rejects(
    async () =>
      reserveVariantWorkflow(
        repo,
        { variant_id: "var_03", cart_id: "cart_02" },
        now
      ),
    (err: any) => {
      assert.ok(err instanceof ItemHeldError);
      assert.strictEqual(err.code, "ITEM_HELD");
      assert.strictEqual(err.retryable, false);
      return true;
    }
  );
});
