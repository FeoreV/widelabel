import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { runReservationSweeperBatch } from "./reservation-sweeper.worker.ts";

test("runReservationSweeperBatch sweeps expired reservations in batch", async () => {
  const repo = new InMemoryReservationRepository();
  const past = new Date("2026-07-21T10:00:00.000Z");
  const future = new Date("2026-07-21T10:30:00.000Z");

  const res1 = await repo.create({
    variant_id: "var_sweep_01",
    cart_id: "cart_01",
    expires_at: past,
  });

  const res2 = await repo.create({
    variant_id: "var_sweep_02",
    cart_id: "cart_02",
    expires_at: past,
  });

  const res3 = await repo.create({
    variant_id: "var_sweep_03",
    cart_id: "cart_03",
    expires_at: future,
  });

  const now = new Date("2026-07-21T10:15:00.000Z");
  const result = await runReservationSweeperBatch(repo, now);

  assert.strictEqual(result.sweptCount, 2);
  assert.deepStrictEqual(result.expiredReservationIds.sort(), [res1.id, res2.id].sort());

  // Future reservation remains open
  const openRes3 = await repo.findOpenByVariant("var_sweep_03");
  assert.ok(openRes3);
  assert.strictEqual(openRes3?.id, res3.id);
});

test("runReservationSweeperBatch is idempotent on subsequent runs", async () => {
  const repo = new InMemoryReservationRepository();
  const past = new Date("2026-07-21T10:00:00.000Z");

  await repo.create({
    variant_id: "var_sweep_04",
    cart_id: "cart_04",
    expires_at: past,
  });

  const now = new Date("2026-07-21T10:15:00.000Z");
  const run1 = await runReservationSweeperBatch(repo, now);
  assert.strictEqual(run1.sweptCount, 1);

  const run2 = await runReservationSweeperBatch(repo, now);
  assert.strictEqual(run2.sweptCount, 0);
});
