import assert from "node:assert";
import test from "node:test";
import { AddToCartButton } from "./add-to-cart-button";

test("AddToCartButton export exists and is a function component", () => {
  assert.strictEqual(typeof AddToCartButton, "function");
});
