import assert from "node:assert";
import test from "node:test";
import { ApiShippingProvider, FakeShippingProvider } from "../../lib/shipping/provider";
import { ShippingStep } from "./shipping-step";

test("FakeShippingProvider returns non-empty shipping options in test mode", async () => {
  const provider = new FakeShippingProvider();
  const options = await provider.getAvailableOptions();
  assert.ok(options.length > 0);
  assert.strictEqual(options[0].type, "address");
});

test("ApiShippingProvider handles successful rate response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ price: 450, currency: "RUB", period_min: 2, period_max: 4 }), { status: 200 });

  try {
    const provider = new ApiShippingProvider("http://localhost:9000");
    const options = await provider.getAvailableOptions(44);
    assert.strictEqual(options.length, 1);
    assert.strictEqual(options[0].price, 450);
    assert.strictEqual(options[0].provider, "cdek");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ApiShippingProvider throws clear error on API failure without returning fake fallback", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Internal Server Error", { status: 500 });

  try {
    const provider = new ApiShippingProvider("http://localhost:9000");
    await assert.rejects(async () => {
      await provider.getAvailableOptions(44);
    }, /Shipping rate calculation failed/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ShippingStep export exists and is a function component", () => {
  assert.strictEqual(typeof ShippingStep, "function");
});
