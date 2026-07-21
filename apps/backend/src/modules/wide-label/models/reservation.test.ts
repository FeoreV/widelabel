import assert from "node:assert";
import test from "node:test";
import { Reservation, ReservationStatusEnum } from "./reservation.ts";

test("Reservation model is defined with correct name", () => {
  assert.strictEqual(Reservation.name, "WideLabelReservation");
});

test("ReservationStatusEnum contains expected values", () => {
  assert.deepStrictEqual(ReservationStatusEnum, [
    "active",
    "payment_pending",
    "released",
    "expired",
    "converted",
    "cancelled",
  ]);
});
