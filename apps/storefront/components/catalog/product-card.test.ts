import assert from "node:assert";
import test from "node:test";
import { ProductCard, formatPrice } from "./product-card";
import type { CatalogProduct } from "../../lib/catalog/queries";

test("formatPrice formats RUB prices correctly without hardcoding USD", () => {
  const rubPrice = formatPrice(1290000, "RUB");
  assert.ok(rubPrice.includes("12"), "Should include numeric part");
  assert.ok(rubPrice.includes("₽"), "Should include ruble symbol");

  const usdPrice = formatPrice(12000, "USD");
  assert.ok(usdPrice.includes("120") || usdPrice.includes("$"));
});

test("ProductCard export exists and is a function component", () => {
  assert.strictEqual(typeof ProductCard, "function");
});

test("ProductCard component structure handles product metadata and missing thumbnail", () => {
  const sampleProduct: CatalogProduct = {
    id: "prod_stone_island_01",
    title: "Stone Island Sweatshirt",
    description: "Archival Stone Island crewneck",
    thumbnail: null,
    metadata: {
      brand: "Stone Island",
    },
    variants: [
      {
        id: "var_stone_island_01",
        title: "Size L",
        price: 1150000,
        currency_code: "RUB",
      },
    ],
  };

  const vnode = ProductCard({ product: sampleProduct });
  assert.ok(vnode);
  assert.strictEqual(vnode.type, "article");
});
