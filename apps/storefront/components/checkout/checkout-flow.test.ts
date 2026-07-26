import assert from "node:assert";
import test from "node:test";
import { CheckoutFlow } from "./checkout-flow";

test("CheckoutFlow export exists and is a function component", () => {
  assert.strictEqual(typeof CheckoutFlow, "function");
});
