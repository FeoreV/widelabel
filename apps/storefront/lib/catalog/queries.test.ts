import assert from "node:assert";
import test from "node:test";
import { getCatalogProducts, getCatalogProductById } from "./queries";

test("getCatalogProducts returns list of drop items", async () => {
  const products = await getCatalogProducts();
  assert.ok(Array.isArray(products));
  assert.ok(products.length > 0);
  assert.strictEqual(products[0].id, "prod_vintage_tee_01");
});

test("getCatalogProductById returns product and availability status", async () => {
  const { product, availability } = await getCatalogProductById("prod_vintage_tee_01");
  assert.strictEqual(product.id, "prod_vintage_tee_01");
  assert.ok(availability);
  assert.ok(availability?.status);
});
