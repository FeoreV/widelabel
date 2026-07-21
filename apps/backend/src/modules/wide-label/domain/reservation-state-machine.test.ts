import assert from "node:assert";
import test from "node:test";
import {
  canTransitionReservation,
  transitionReservationStatus,
  InvalidStateTransitionError,
} from "./reservation-state-machine.ts";

test("allows valid state transitions", () => {
  assert.strictEqual(canTransitionReservation("active", "payment_pending"), true);
  assert.strictEqual(canTransitionReservation("active", "released"), true);
  assert.strictEqual(canTransitionReservation("active", "expired"), true);
  assert.strictEqual(canTransitionReservation("payment_pending", "converted"), true);
  assert.strictEqual(canTransitionReservation("payment_pending", "released"), true);
});

test("forbids invalid state transitions", () => {
  assert.strictEqual(canTransitionReservation("released", "active"), false);
  assert.strictEqual(canTransitionReservation("expired", "payment_pending"), false);
  assert.strictEqual(canTransitionReservation("converted", "active"), false);
});

test("transitionReservationStatus returns next status for valid transition", () => {
  const result = transitionReservationStatus("active", "payment_pending");
  assert.strictEqual(result, "payment_pending");
});

test("transitionReservationStatus is idempotent for same status", () => {
  const result = transitionReservationStatus("active", "active");
  assert.strictEqual(result, "active");
});

test("transitionReservationStatus throws InvalidStateTransitionError for forbidden transition", () => {
  assert.throws(
    () => transitionReservationStatus("converted", "active"),
    InvalidStateTransitionError
  );
});
