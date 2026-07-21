import assert from "node:assert";
import test from "node:test";
import { getStorefrontStatus } from "./index.js";

test("getStorefrontStatus returns ok", () => {
  const status = getStorefrontStatus();
  assert.strictEqual(status.status, "ok");
});
