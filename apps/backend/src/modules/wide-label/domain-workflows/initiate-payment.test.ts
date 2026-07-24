import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../repositories/reservation-repository.ts";
import { InMemoryPaymentAttemptRepository } from "../models/payment-attempt.ts";
import { YooKassaClient } from "../../../integrations/yookassa/client.ts";
import { initiatePaymentWorkflow } from "./initiate-payment.ts";

test("initiatePaymentWorkflow transitions reservation to payment_pending and creates PaymentAttempt", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reservationRepo.create({
    id: "res_01",
    variant_id: "var_01",
    cart_id: "cart_01",
    status: "active",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  const mockClient = new YooKassaClient("shop", "secret");
  mockClient.createPayment = async (input) => ({
    id: "yoo_pay_100",
    status: "pending",
    paid: false,
    amount: input.amount,
    confirmation: {
      type: "redirect",
      confirmation_url: "https://yoomoney.ru/checkout/payments/contract?id=yoo_pay_100",
    },
    created_at: new Date().toISOString(),
  });

  const result = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    {
      cart_id: "cart_01",
      reservation_id: reservation.id,
      provider: "yookassa",
      amount: 12000,
      currency_code: "RUB",
      idempotency_key: "idem_pay_test_01",
      return_url: "https://example.com/checkout/success",
    }
  );

  assert.strictEqual(result.payment_attempt.status, "pending");
  assert.strictEqual(result.payment_attempt.external_payment_id, "yoo_pay_100");
  assert.strictEqual(
    result.confirmation_url,
    "https://yoomoney.ru/checkout/payments/contract?id=yoo_pay_100"
  );

  const updatedReservation = await reservationRepo.findById(reservation.id);
  assert.strictEqual(updatedReservation?.status, "payment_pending");
});

test("initiatePaymentWorkflow is idempotent on retry with same idempotency key", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reservationRepo.create({
    id: "res_02",
    variant_id: "var_02",
    cart_id: "cart_02",
    status: "active",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  const mockClient = new YooKassaClient("shop", "secret");
  let createCallCount = 0;
  mockClient.createPayment = async (input) => {
    createCallCount++;
    return {
      id: "yoo_pay_200",
      status: "pending",
      paid: false,
      amount: input.amount,
      confirmation: {
        type: "redirect",
        confirmation_url: "https://yoomoney.ru/checkout/payments/contract?id=yoo_pay_200",
      },
      created_at: new Date().toISOString(),
    };
  };

  const payload = {
    cart_id: "cart_02",
    reservation_id: reservation.id,
    provider: "yookassa" as const,
    amount: 12000,
    currency_code: "RUB",
    idempotency_key: "idem_pay_retry_key",
    return_url: "https://example.com/checkout/success",
  };

  const firstCall = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    payload
  );

  const secondCall = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    payload
  );

  assert.strictEqual(createCallCount, 1, "YooKassa client MUST NOT be called again on retry");
  assert.strictEqual(secondCall.payment_attempt.id, firstCall.payment_attempt.id);
});
