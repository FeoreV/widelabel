import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { runReservationSweeperBatch } from "../src/jobs/reservation-sweeper.worker.ts";
import { getPgPool, closePgPool } from "../src/infra/db.ts";

test("P0-C Integration: Sweeper catches expired reservations missed by worker", async () => {
  const pool = getPgPool();
  const repo = new PostgresReservationRepository(pool);

  const past = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();

  const variantId = `var_sweep_${Date.now()}`;
  const reservedAt = new Date(past.getTime() - 15 * 60 * 1000);
  const res = await repo.create({
    variant_id: variantId,
    cart_id: `cart_sweep_${Date.now()}`,
    status: "active",
    expires_at: past,
  }, reservedAt);

  // Run sweeper batch against real PostgreSQL
  const sweepResult = await runReservationSweeperBatch(repo, now);
  assert.ok(sweepResult.sweptCount >= 1);

  const sweptRes = await repo.findById(res.id);
  assert.strictEqual(sweptRes?.status, "expired");

  // Subsequent sweep run is idempotent
  const repeatSweep = await runReservationSweeperBatch(repo, now);
  const reChecked = await repo.findById(res.id);
  assert.strictEqual(reChecked?.status, "expired");

  await closePgPool();
});

test.after(async () => {
  await closePgPool();
});

