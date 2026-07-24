import assert from "node:assert";
import test from "node:test";
import { InMemoryAdminDropService } from "./drop-admin.ts";

test("AdminDropService supports drop CRUD and product assignment", () => {
  const service = new InMemoryAdminDropService();

  // Create
  const drop = service.createDrop({
    title: "Summer Drop 2026",
    slug: "summer-2026",
    starts_at: new Date("2026-08-01T12:00:00Z"),
    status: "scheduled",
  });

  assert.strictEqual(drop.title, "Summer Drop 2026");
  assert.strictEqual(drop.status, "scheduled");

  // Read
  const found = service.getDrop(drop.id);
  assert.strictEqual(found?.id, drop.id);

  // List
  const list = service.listDrops();
  assert.strictEqual(list.length, 1);

  // Update
  const updated = service.updateDrop(drop.id, { status: "active" });
  assert.strictEqual(updated?.status, "active");

  // Product Assignment
  const assigned = service.assignProductsToDrop(drop.id, ["prod_101", "prod_102"]);
  assert.deepStrictEqual(assigned, ["prod_101", "prod_102"]);

  const dropProducts = service.getDropProducts(drop.id);
  assert.deepStrictEqual(dropProducts, ["prod_101", "prod_102"]);

  // Delete
  const deleted = service.deleteDrop(drop.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(service.getDrop(drop.id), null);
});
