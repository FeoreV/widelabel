import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { InMemoryPaymentAttemptRepository } from "../src/modules/wide-label/models/payment-attempt.ts";
import { YooKassaClient } from "../src/integrations/yookassa/client.ts";
import { reserveVariantWorkflow } from "../src/modules/wide-label/domain-workflows/reserve-variant.ts";
import { initiatePaymentWorkflow } from "../src/modules/wide-label/domain-workflows/initiate-payment.ts";
import { processPaymentWebhookWorkflow } from "../src/modules/wide-label/domain-workflows/process-payment-webhook.ts";

test("Payment Security: unsupported payment provider is strictly rejected", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();
  const mockYooKassa = new YooKassaClient("shop", "secret");

  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_sec_01",
    cart_id: "cart_sec_01",
  });

  await assert.rejects(
    async () =>
      initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
        cart_id: "cart_sec_01",
        reservation_id: reservation.id,
        provider: "tinkoff" as any,
        amount: 15000,
        currency_code: "RUB",
        idempotency_key: "idem_sec_01",
        return_url: "https://wide-label.com/checkout/success",
      }),
    /Unsupported payment provider/
  );
});

test("Payment Security: reservation belonging to another cart is strictly rejected", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();
  const mockYooKassa = new YooKassaClient("shop", "secret");

  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_sec_02",
    cart_id: "cart_owner",
  });

  await assert.rejects(
    async () =>
      initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
        cart_id: "cart_attacker",
        reservation_id: reservation.id,
        provider: "yookassa",
        amount: 15000,
        currency_code: "RUB",
        idempotency_key: "idem_sec_02",
        return_url: "https://wide-label.com/checkout/success",
      }),
    /Reservation cart ID mismatch/
  );
});

test("Payment Security: webhook with currency mismatch strictly rejects payment", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();
  const mockYooKassa = new YooKassaClient("shop", "secret");

  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_sec_03",
    cart_id: "cart_sec_03",
  });

  mockYooKassa.createPayment = async () => ({
    id: "yoo_sec_pay_3",
    status: "pending",
    paid: false,
    amount: { value: "150.00", currency: "RUB" },
    confirmation: {
      type: "redirect",
      confirmation_url: "https://yoomoney.ru/checkout/payments/contract?id=yoo_sec_pay_3",
    },
    created_at: new Date().toISOString(),
  });

  await initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
    cart_id: "cart_sec_03",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 15000,
    currency_code: "RUB",
    idempotency_key: "idem_sec_03",
    return_url: "https://wide-label.com/checkout/success",
  });

  mockYooKassa.getPayment = async () => ({
    id: "yoo_sec_pay_3",
    status: "succeeded",
    paid: true,
    amount: { value: "150.00", currency: "USD" },
    created_at: new Date().toISOString(),
  });

  await assert.rejects(
    async () =>
      processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
        provider_payment_id: "yoo_sec_pay_3",
        event_type: "payment.succeeded",
      }),
    /Payment amount\/currency mismatch/
  );
});

test("Payment Security: webhook for unknown payment attempt is rejected", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();
  const mockYooKassa = new YooKassaClient("shop", "secret");

  mockYooKassa.getPayment = async () => ({
    id: "yoo_unknown_999",
    status: "succeeded",
    paid: true,
    amount: { value: "150.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  await assert.rejects(
    async () =>
      processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
        provider_payment_id: "yoo_unknown_999",
        event_type: "payment.succeeded",
      }),
    /No PaymentAttempt found/
  );
});
