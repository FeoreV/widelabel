import assert from "node:assert";
import test from "node:test";
import { EditorialStorySection } from "./editorial-story-section";

test("EditorialStorySection export exists and is a function component", () => {
  assert.strictEqual(typeof EditorialStorySection, "function");
  const comp = EditorialStorySection();
  assert.ok(comp);
});
