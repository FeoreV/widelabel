import assert from "node:assert";
import test from "node:test";
import { SiteHeader } from "./site-header";

test("SiteHeader export exists and is a function component", () => {
  assert.strictEqual(typeof SiteHeader, "function");
});
