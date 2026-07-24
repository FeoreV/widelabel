import assert from "node:assert";
import test from "node:test";
import { FeatureStrip } from "./feature-strip";

test("FeatureStrip export exists and renders feature strip component structure", () => {
  assert.strictEqual(typeof FeatureStrip, "function");
  const result = FeatureStrip();
  assert.ok(result);
  assert.strictEqual(result.type, "section");
  assert.strictEqual(result.props.className, "feature-strip");
});
