import assert from "node:assert";
import test from "node:test";
import {
  OrderSnapshotRepository,
  OrderSnapshotImmutableError,
} from "./order-snapshot.ts";

test("OrderSnapshotRepository creates and retrieves immutable OrderSnapshot", () => {
  const repo = new OrderSnapshotRepository();

  const snapshot = repo.create({
    id: "snap_01",
    order_id: "order_100",
    variant_id: "var_vintage_tee",
    title: "Wide Label Vintage Tee",
    price: 12000,
    currency_code: "USD",
    measurements: {
      version: 1,
      unit: "cm",
      fields: { chest: 60, length: 72 },
    },
    defects: [],
    media_checksums: { "front.jpg": "sha256_checksum_hash" },
    consent_version: "v1.0-2026-07",
    created_at: new Date(),
  });

  assert.strictEqual(snapshot.id, "snap_01");
  assert.strictEqual(snapshot.order_id, "order_100");
  assert.strictEqual(snapshot.price, 12000);

  const found = repo.findById("snap_01");
  assert.ok(found);
  assert.strictEqual(found.title, "Wide Label Vintage Tee");
});

test("OrderSnapshotRepository update attempt strictly throws OrderSnapshotImmutableError", () => {
  const repo = new OrderSnapshotRepository();

  assert.throws(() => {
    repo.update();
  }, OrderSnapshotImmutableError);
});
