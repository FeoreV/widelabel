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

test("ProductCard handles reserved and sold out status states", () => {
  const sampleProduct: CatalogProduct = {
    id: "prod_reserved_01",
    title: "Maison Margiela Tabi Boots",
    description: "Tabi boots 1-of-1",
    thumbnail: "https://example.com/tabi.jpg",
    metadata: {
      brand: "Maison Margiela",
      status: "reserved",
    },
    variants: [
      {
        id: "var_tabi_01",
        title: "Size 42",
        price: 4500000,
        currency_code: "RUB",
      },
    ],
  };

  const reservedCard = ProductCard({ product: sampleProduct, availabilityStatus: "reserved" });
  assert.ok(reservedCard);
  assert.strictEqual(reservedCard.props.className.includes("product-card-reserved"), true);

  const soldCard = ProductCard({ product: sampleProduct, availabilityStatus: "sold" });
  assert.ok(soldCard);
  assert.strictEqual(soldCard.props.className.includes("product-card-sold"), true);
});
