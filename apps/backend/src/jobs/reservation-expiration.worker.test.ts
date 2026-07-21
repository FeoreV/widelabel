import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { processReservationExpirationJob } from "./reservation-expiration.worker.ts";

test("processReservationExpirationJob expires open reservation when past expires_at", async () => {
  const repo = new InMemoryReservationRepository();
  const past = new Date("2026-07-21T10:00:00.000Z");

  const created = await repo.create({
    variant_id: "var_exp_01",
    cart_id: "cart_01",
    expires_at: past,
  });

  const now = new Date("2026-07-21T10:15:01.000Z");
  const result = await processReservationExpirationJob(
    repo,
    { reservation_id: created.id, variant_id: "var_exp_01" },
    now
  );

  assert.strictEqual(result.processed, true);
  assert.strictEqual(result.reservation_id, created.id);

  const openByVariant = await repo.findOpenByVariant("var_exp_01");
  assert.strictEqual(openByVariant, null);
});

test("processReservationExpirationJob is idempotent when reservation is already released or missing", async () => {
  const repo = new InMemoryReservationRepository();
  const now = new Date();

  const result = await processReservationExpirationJob(
    repo,
    { reservation_id: "non_existent_id", variant_id: "var_exp_02" },
    now
  );

  assert.strictEqual(result.processed, false);
  assert.strictEqual(result.reason, "reservation_not_active_or_not_found");
});

test("processReservationExpirationJob does not expire reservation if not reached expires_at", async () => {
  const repo = new InMemoryReservationRepository();
  const future = new Date("2026-07-21T10:30:00.000Z");

  const created = await repo.create({
    variant_id: "var_exp_03",
    cart_id: "cart_01",
    expires_at: future,
  });

  const now = new Date("2026-07-21T10:15:00.000Z");
  const result = await processReservationExpirationJob(
    repo,
    { reservation_id: created.id, variant_id: "var_exp_03" },
    now
  );

  assert.strictEqual(result.processed, false);
  assert.strictEqual(result.reason, "reservation_not_expired_yet");
});
