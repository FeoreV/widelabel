import assert from "node:assert";
import test from "node:test";
import { CatalogFilterControls } from "./catalog-filter-controls";

test("CatalogFilterControls export exists and is a function component", () => {
  assert.strictEqual(typeof CatalogFilterControls, "function");
});
