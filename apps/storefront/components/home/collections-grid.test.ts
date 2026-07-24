import assert from "node:assert";
import test from "node:test";
import { CollectionsGrid } from "./collections-grid";

test("CollectionsGrid export exists and renders collections component structure", () => {
  assert.strictEqual(typeof CollectionsGrid, "function");
  const result = CollectionsGrid();
  assert.ok(result);
  assert.strictEqual(result.type, "section");
  assert.strictEqual(result.props.className, "collections-section");
});
