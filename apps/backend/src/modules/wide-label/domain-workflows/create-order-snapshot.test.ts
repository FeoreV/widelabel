import assert from "node:assert";
import test from "node:test";
import { OrderSnapshotRepository } from "../models/order-snapshot.ts";
import {
  createOrderSnapshotWorkflow,
  type ServerProductCatalogProvider,
} from "./create-order-snapshot.ts";

test("createOrderSnapshotWorkflow builds immutable snapshot from server-side product data", async () => {
  const repo = new OrderSnapshotRepository();

  const mockCatalogProvider: ServerProductCatalogProvider = {
    async getCanonicalVariantData(variantId: string) {
      return {
        title: `Server Canonical Product (${variantId})`,
        price: 15000,
        currency_code: "USD",
        measurements: {
          version: 1,
          unit: "cm",
          fields: { chest: 58, length: 74 },
        },
        defects: [
          {
            kind: "stain",
            description: "Minor vintage patina",
            severity: "minor",
          },
        ],
        media_checksums: {
          "front.jpg": "sha256_front_hash",
          "back.jpg": "sha256_back_hash",
        },
      };
    },
  };

  const snapshot = await createOrderSnapshotWorkflow(repo, mockCatalogProvider, {
    order_id: "order_999",
    variant_id: "var_01",
    consent_version: "v1.0-2026-07",
  });

  assert.strictEqual(snapshot.order_id, "order_999");
  assert.strictEqual(snapshot.price, 15000);
  assert.strictEqual(snapshot.title, "Server Canonical Product (var_01)");
  assert.strictEqual(snapshot.defects.length, 1);
  assert.strictEqual(snapshot.media_checksums["front.jpg"], "sha256_front_hash");

  const stored = repo.findById(snapshot.id);
  assert.ok(stored);
  assert.strictEqual(stored.order_id, "order_999");
});
