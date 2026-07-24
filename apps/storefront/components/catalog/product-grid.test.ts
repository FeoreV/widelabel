import assert from "node:assert";
import test from "node:test";
import { ProductGrid } from "./product-grid";
import type { CatalogProduct } from "../../lib/catalog/queries";

test("ProductGrid handles error state", () => {
  const vnode = ProductGrid({ products: [], error: "Network Failure" });
  assert.ok(vnode);
  assert.strictEqual(vnode.props.className.includes("product-grid-error"), true);
});

test("ProductGrid handles loading state", () => {
  const vnode = ProductGrid({ products: [], isLoading: true });
  assert.ok(vnode);
  assert.strictEqual(vnode.props.className.includes("product-grid-skeleton"), true);
});

test("ProductGrid handles empty state", () => {
  const vnode = ProductGrid({ products: [] });
  assert.ok(vnode);
  assert.strictEqual(vnode.props.className.includes("product-grid-empty"), true);
});

test("ProductGrid renders list of products", () => {
  const sampleProducts: CatalogProduct[] = [
    {
      id: "prod_01",
      title: "Test Item 1",
      description: "Description 1",
      thumbnail: null,
      variants: [
        {
          id: "var_01",
          title: "Default",
          price: 5000,
          currency_code: "RUB",
        },
      ],
    },
  ];

  const vnode = ProductGrid({ products: sampleProducts });
  assert.ok(vnode);
  assert.strictEqual(vnode.props.className, "product-grid");
});
