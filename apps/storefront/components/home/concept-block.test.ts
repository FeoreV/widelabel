import assert from "node:assert";
import test from "node:test";
import { ConceptBlock } from "./concept-block";

test("ConceptBlock export exists and is a function component", () => {
  assert.strictEqual(typeof ConceptBlock, "function");
  const comp = ConceptBlock();
  assert.ok(comp);
});
