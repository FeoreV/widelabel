import assert from "node:assert";
import test from "node:test";
import { CartDrawer } from "./cart-drawer";

test("CartDrawer returns null when closed", () => {
  const result = CartDrawer({ cart: null, isOpen: false, onClose: () => {} });
  assert.strictEqual(result, null);
});

test("CartDrawer renders loading state when isLoading is true", () => {
  const result = CartDrawer({ cart: null, isOpen: true, isLoading: true, onClose: () => {} });
  assert.ok(result);
});

test("CartDrawer renders error state when error is provided", () => {
  const result = CartDrawer({
    cart: null,
    isOpen: true,
    error: "Failed to hold item",
    onClose: () => {},
  });
  assert.ok(result);
});
