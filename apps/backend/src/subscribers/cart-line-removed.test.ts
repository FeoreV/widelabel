import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { reserveVariantWorkflow } from "../workflows/reserve-variant.ts";
import { handleCartLineRemoved } from "./cart-line-removed.ts";

test("handleCartLineRemoved releases open reservation immediately when cart item is removed", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date("2026-07-21T10:00:00.000Z");

  const created = await repo.create({
    variant_id: "var_rel_01",
    cart_id: "cart_01",
    expires_at: new Date(now.getTime() + 15 * 60 * 1000),
  });

  const handled = await handleCartLineRemoved(
    repo,
    { cart_id: "cart_01", variant_id: "var_rel_01" },
    now
  );

  assert.strictEqual(handled, true);

  const openByVariant = await repo.findOpenByVariant("var_rel_01");
  assert.strictEqual(openByVariant, null);
});

test("handleCartLineRemoved is idempotent and returns false if no open reservation exists", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date();

  const handled = await handleCartLineRemoved(
    repo,
    { cart_id: "cart_99", variant_id: "var_rel_99" },
    now
  );

  assert.strictEqual(handled, false);
});
