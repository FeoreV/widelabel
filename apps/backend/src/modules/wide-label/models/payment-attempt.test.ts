import assert from "node:assert";
import test from "node:test";
import {
  InMemoryPaymentAttemptRepository,
  DuplicateIdempotencyKeyError,
} from "./payment-attempt.ts";

test("InMemoryPaymentAttemptRepository creates and looks up attempt by idempotency key", () => {
  const repo = new InMemoryPaymentAttemptRepository();
  const now = new Date();

  const attempt = repo.create({
    id: "pay_01",
    idempotency_key: "idem_cart_01_attempt_1",
    cart_id: "cart_01",
    reservation_id: "res_01",
    provider: "yookassa",
    amount: 12000,
    currency_code: "RUB",
    status: "pending",
    created_at: now,
    updated_at: now,
  });

  assert.strictEqual(attempt.id, "pay_01");
  assert.strictEqual(attempt.status, "pending");

  const lookedUp = repo.findByIdempotencyKey("idem_cart_01_attempt_1");
  assert.ok(lookedUp);
  assert.strictEqual(lookedUp.id, "pay_01");
});

test("InMemoryPaymentAttemptRepository rejects duplicate idempotency key", () => {
  const repo = new InMemoryPaymentAttemptRepository();
  const now = new Date();

  repo.create({
    id: "pay_01",
    idempotency_key: "idem_dup_key",
    cart_id: "cart_01",
    reservation_id: "res_01",
    provider: "yookassa",
    amount: 12000,
    currency_code: "RUB",
    status: "pending",
    created_at: now,
    updated_at: now,
  });

  assert.throws(() => {
    repo.create({
      id: "pay_02",
      idempotency_key: "idem_dup_key",
      cart_id: "cart_01",
      reservation_id: "res_01",
      provider: "yookassa",
      amount: 12000,
      currency_code: "RUB",
      status: "pending",
      created_at: now,
      updated_at: now,
    });
  }, DuplicateIdempotencyKeyError);
});

test("InMemoryPaymentAttemptRepository updates status and external_payment_id", () => {
  const repo = new InMemoryPaymentAttemptRepository();
  const now = new Date();

  repo.create({
    id: "pay_03",
    idempotency_key: "idem_status_test",
    cart_id: "cart_01",
    reservation_id: "res_01",
    provider: "tinkoff",
    amount: 15000,
    currency_code: "RUB",
    status: "pending",
    created_at: now,
    updated_at: now,
  });

  const updated = repo.updateStatus("pay_03", "succeeded", "ext_pay_12345");
  assert.strictEqual(updated.status, "succeeded");
  assert.strictEqual(updated.external_payment_id, "ext_pay_12345");
});
