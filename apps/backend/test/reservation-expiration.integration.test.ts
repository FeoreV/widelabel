import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { processReservationExpirationJob } from "../src/jobs/reservation-expiration.worker.ts";
import { getPgPool } from "../src/infra/db.ts";

test("P0-C Integration: Expiration worker releases reservation past expires_at", async () => {
  const pool = getPgPool();
  const repo = new PostgresReservationRepository(pool);

  const past = new Date(Date.now() - 30 * 60 * 1000);
  const now = new Date();

  const reservedAt = new Date(past.getTime() - 15 * 60 * 1000);
  const res = await repo.create({
    variant_id: `var_exp_${Date.now()}`,
    cart_id: `cart_exp_${Date.now()}`,
    status: "active",
    expires_at: past,
  }, reservedAt);

  assert.strictEqual(res.status, "active");

  const result = await processReservationExpirationJob(
    repo,
    { reservation_id: res.id, variant_id: res.variant_id },
    now
  );

  assert.strictEqual(result.processed, true);

  const updated = await repo.findById(res.id);
  assert.strictEqual(updated?.status, "expired");

  // Duplicate call on worker retry is idempotent
  const repeat = await processReservationExpirationJob(
    repo,
    { reservation_id: res.id, variant_id: res.variant_id },
    now
  );
  assert.strictEqual(repeat.processed, false);
});
