import assert from "node:assert";
import test from "node:test";
import {
  isBaseEntity,
  ConditionLabelEnum,
  MeasurementsSchema,
  CartHoldResponseSchema,
  AvailabilityResponseSchema,
} from "./index.js";

test("isBaseEntity validates object", () => {
  const entity = { id: "123", createdAt: new Date(), updatedAt: new Date() };
  assert.strictEqual(isBaseEntity(entity), true);
});

test("ConditionLabelEnum parses valid label", () => {
  const label = ConditionLabelEnum.parse("excellent");
  assert.strictEqual(label, "excellent");
});

test("MeasurementsSchema parses valid measurements", () => {
  const measurements = MeasurementsSchema.parse({
    version: 1,
    unit: "cm",
    fields: { chest: 58, length: 72 },
  });
  assert.strictEqual(measurements.fields.chest, 58);
});

test("CartHoldResponseSchema parses valid hold response", () => {
  const res = CartHoldResponseSchema.parse({
    reservation_id: "res_01J",
    variant_id: "variant_01J",
    cart_id: "cart_01J",
    reserved_until: "2026-07-21T10:14:59.123Z",
    server_time: "2026-07-21T09:59:59.123Z",
  });
  assert.strictEqual(res.reservation_id, "res_01J");
});

test("AvailabilityResponseSchema parses valid response", () => {
  const avail = AvailabilityResponseSchema.parse({
    variant_id: "variant_01J",
    status: "available",
    reserved_until: null,
  });
  assert.strictEqual(avail.status, "available");
});
