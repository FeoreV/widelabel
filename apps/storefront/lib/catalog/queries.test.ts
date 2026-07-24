import assert from "node:assert";
import test from "node:test";
import { getCatalogProducts, getCatalogProductById } from "./queries";

test("getCatalogProducts maps successful Medusa API response correctly", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const urlStr = String(url);
    if (urlStr.includes("/store/products")) {
      return new Response(
        JSON.stringify({
          products: [
            {
              id: "prod_real_01",
              title: "Real Vintage Denim Jacket",
              description: "100% Cotton vintage jacket",
              handle: "real-vintage-denim-jacket",
              thumbnail: "https://example.com/denim.jpg",
              metadata: {
                brand: "Levi's",
                era: "1990s",
              },
              variants: [
                {
                  id: "var_real_01",
                  title: "Size M",
                  price: 890000,
                  currency_code: "RUB",
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/availability")) {
      return new Response(
        JSON.stringify({
          variant_id: "var_real_01",
          status: "available",
          reserved_until: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(null, { status: 404 });
  };

  try {
    const products = await getCatalogProducts();
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].id, "prod_real_01");
    assert.strictEqual(products[0].title, "Real Vintage Denim Jacket");
    assert.strictEqual(products[0].metadata?.brand, "Levi's");
    assert.strictEqual(products[0].variants[0].price, 890000);
    assert.strictEqual(products[0].variants[0].currency_code, "RUB");

    const single = await getCatalogProductById("prod_real_01");
    assert.strictEqual(single.product.id, "prod_real_01");
    assert.strictEqual(single.availability?.status, "available");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCatalogProducts handles empty products list", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const products = await getCatalogProducts();
    assert.ok(Array.isArray(products));
    assert.strictEqual(products.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCatalogProducts throws clear error on network connection failure", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  try {
    await assert.rejects(
      async () => {
        await getCatalogProducts();
      },
      (err: Error) => {
        assert.ok(err.message.includes("Сервер каталога Medusa недоступен"));
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCatalogProducts throws error on malformed response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ invalid: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await assert.rejects(
      async () => {
        await getCatalogProducts();
      },
      (err: Error) => {
        assert.ok(err.message.includes("Invalid Medusa products API response format"));
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCatalogProducts throws error on API HTTP failure without returning fake data", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await assert.rejects(
      async () => {
        await getCatalogProducts();
      },
      (err: Error) => {
        assert.ok(err.message.includes("Medusa API error"));
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCatalogProductById throws error when product is missing without returning fake fallback object", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await assert.rejects(
      async () => {
        await getCatalogProductById("non_existent_id");
      },
      (err: Error) => {
        assert.ok(err.message.includes("Product with id \"non_existent_id\" not found"));
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
