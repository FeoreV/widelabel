import assert from "node:assert";
import test from "node:test";
import {
  CustomerInfoSchema,
  ShippingAddressSchema,
  PvzSelectionSchema,
  LegalConsentSchema,
  CheckoutPayloadSchema,
} from "./checkout.js";

test("CustomerInfoSchema validates email, phone, name", () => {
  const valid = CustomerInfoSchema.parse({
    email: "customer@example.com",
    phone: "+79991234567",
    first_name: "Ivan",
    last_name: "Petrov",
  });
  assert.strictEqual(valid.email, "customer@example.com");

  assert.throws(() => {
    CustomerInfoSchema.parse({
      email: "not-an-email",
      phone: "+79991234567",
      first_name: "Ivan",
      last_name: "Petrov",
    });
  });
});

test("LegalConsentSchema rejects false consent flags", () => {
  assert.throws(() => {
    LegalConsentSchema.parse({
      terms_accepted: false,
      privacy_accepted: true,
      consent_version: "v1.0",
    });
  });
});

test("CheckoutPayloadSchema validates complete checkout submission", () => {
  const valid = CheckoutPayloadSchema.parse({
    cart_id: "cart_01JXYZ",
    customer: {
      email: "buyer@example.com",
      phone: "+79998887766",
      first_name: "Alex",
      last_name: "Smith",
    },
    shipping_address: {
      address_1: "Main St 123",
      city: "Moscow",
      postal_code: "101000",
      country_code: "RU",
    },
    payment: {
      provider: "tinkoff",
    },
    consent: {
      terms_accepted: true,
      privacy_accepted: true,
      consent_version: "v1.0",
    },
  });

  assert.strictEqual(valid.cart_id, "cart_01JXYZ");
  assert.strictEqual(valid.payment.provider, "tinkoff");
});
