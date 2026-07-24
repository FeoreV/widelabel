import assert from "node:assert";
import test from "node:test";
import { HeroSection } from "./hero";

test("HeroSection export exists and is a function component", () => {
  assert.strictEqual(typeof HeroSection, "function");
});
