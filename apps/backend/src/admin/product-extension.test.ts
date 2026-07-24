import assert from "node:assert";
import test from "node:test";
import { InMemoryAdminProductExtensionService } from "./product-extension.ts";
import { OrderSnapshotRepository } from "../modules/wide-label/models/order-snapshot.ts";

test("AdminProductExtensionService updates product metadata while leaving OrderSnapshot untouched", async () => {
  const adminService = new InMemoryAdminProductExtensionService();
  const snapshotRepo = new OrderSnapshotRepository();

  // Create an existing snapshot
  snapshotRepo.create({
    id: "snap_01",
    order_id: "order_snap_01",
    variant_id: "var_01",
    title: "Archival Tee",
    price: 10000,
    currency_code: "RUB",
    measurements: { version: 1, unit: "cm", fields: { chest: 50 } },
    defects: [],
    media_checksums: {},
    consent_version: "v1.0",
    created_at: new Date(),
  });

  // Admin updates live product metadata
  const updatedAdminProduct = adminService.updateProductDetails({
    product_id: "prod_01",
    condition_label: "good",
    measurements: { version: 2, unit: "cm", fields: { chest: 54, waist: 44 } },
    archival_notes: "Minor fade on collar",
  });

  assert.strictEqual(updatedAdminProduct.condition_label, "good");
  assert.strictEqual(updatedAdminProduct.measurements.fields.chest, 54);

  // Verify OrderSnapshot remains strictly unchanged
  const snapshots = snapshotRepo.findByOrderId("order_snap_01");
  assert.strictEqual(snapshots.length, 1);
  assert.strictEqual(snapshots[0].measurements.fields.chest, 50);
  assert.strictEqual(snapshots[0].price, 10000);
});
