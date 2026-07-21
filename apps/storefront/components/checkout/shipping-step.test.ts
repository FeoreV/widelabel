import assert from "node:assert";
import test from "node:test";
import { FakeShippingProvider } from "../../lib/shipping/provider";
import { ShippingStep } from "./shipping-step";

test("FakeShippingProvider returns non-empty shipping options", async () => {
  const provider = new FakeShippingProvider();
  const options = await provider.getAvailableOptions();
  assert.ok(options.length > 0);
  assert.strictEqual(options[0].type, "address");
});

test("ShippingStep export exists and is a function component", () => {
  assert.strictEqual(typeof ShippingStep, "function");
});
