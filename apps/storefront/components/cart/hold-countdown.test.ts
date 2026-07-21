import assert from "node:assert";
import test from "node:test";
import { HoldCountdown } from "./hold-countdown";

test("HoldCountdown export exists and is a function component", () => {
  assert.strictEqual(typeof HoldCountdown, "function");
});
