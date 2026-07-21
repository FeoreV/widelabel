import assert from "node:assert";
import test from "node:test";
import { useAvailabilityPolling } from "./use-availability-polling";

test("useAvailabilityPolling export exists and is a function hook", () => {
  assert.strictEqual(typeof useAvailabilityPolling, "function");
});
