import assert from "node:assert";
import test from "node:test";
import { Drop, DropProduct, DropStatusEnum } from "./drop.ts";

test("Drop model is defined with correct name", () => {
  assert.strictEqual(Drop.name, "WideLabelDrop");
});

test("DropProduct model is defined with correct name", () => {
  assert.strictEqual(DropProduct.name, "WideLabelDropProduct");
});

test("DropStatusEnum contains expected values", () => {
  assert.deepStrictEqual(DropStatusEnum, ["draft", "scheduled", "live", "closed"]);
});
