import assert from "node:assert";
import test from "node:test";
import { SiteFooter } from "./site-footer";

test("SiteFooter export exists and is a function component", () => {
  assert.strictEqual(typeof SiteFooter, "function");
  const comp = SiteFooter();
  assert.ok(comp);
  assert.strictEqual(comp.type, "footer");
});
