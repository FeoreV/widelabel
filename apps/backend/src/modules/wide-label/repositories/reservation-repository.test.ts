import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "./reservation-repository.ts";

test("InMemoryReservationRepository creates and finds open reservation by variant and cart", async () => {
  const repo = new InMemoryReservationRepository();
  const future = new Date(Date.now() + 15 * 60 * 1000);

  const created = await repo.create({
    variant_id: "variant_01",
    cart_id: "cart_01",
    expires_at: future,
  });

  assert.strictEqual(created.variant_id, "variant_01");

  const byVariant = await repo.findOpenByVariant("variant_01");
  assert.ok(byVariant);
  assert.strictEqual(byVariant?.id, created.id);

  const byCart = await repo.findOpenByCart("cart_01");
  assert.strictEqual(byCart.length, 1);
  assert.strictEqual(byCart[0].id, created.id);
});

test("InMemoryReservationRepository prevents multiple open reservations for same variant", async () => {
  const repo = new InMemoryReservationRepository();
  const future = new Date(Date.now() + 15 * 60 * 1000);

  await repo.create({
    variant_id: "variant_02",
    cart_id: "cart_01",
    expires_at: future,
  });

  await assert.rejects(
    async () =>
      repo.create({
        variant_id: "variant_02",
        cart_id: "cart_02",
        expires_at: future,
      }),
    /Open reservation already exists/
  );
});

test("InMemoryReservationRepository finds expired reservations", async () => {
  const repo = new InMemoryReservationRepository();
  const past = new Date(Date.now() - 1000);

  const expiredRes = await repo.create({
    variant_id: "variant_03",
    cart_id: "cart_03",
    expires_at: past,
  });

  const expiredList = await repo.findExpired(new Date());
  assert.strictEqual(expiredList.length, 1);
  assert.strictEqual(expiredList[0].id, expiredRes.id);
});

test("InMemoryReservationRepository updates reservation status", async () => {
  const repo = new InMemoryReservationRepository();
  const future = new Date(Date.now() + 15 * 60 * 1000);

  const created = await repo.create({
    variant_id: "variant_04",
    cart_id: "cart_04",
    expires_at: future,
  });

  const releasedAt = new Date();
  const updated = await repo.updateStatus(created.id, "released", {
    released_at: releasedAt,
    release_reason: "user_removed",
  });

  assert.ok(updated);
  assert.strictEqual(updated?.status, "released");
  assert.strictEqual(updated?.release_reason, "user_removed");

  const openByVariant = await repo.findOpenByVariant("variant_04");
  assert.strictEqual(openByVariant, null);
});
