import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { InMemoryPaymentAttemptRepository } from "../modules/wide-label/models/payment-attempt.ts";
import { YooKassaClient } from "../integrations/yookassa/client.ts";
import { processPaymentWebhookWorkflow } from "./process-payment-webhook.ts";

test("processPaymentWebhookWorkflow verifies YooKassa status server-side and converts reservation", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reservationRepo.create({
    id: "res_webhook_01",
    variant_id: "var_01",
    cart_id: "cart_01",
    status: "payment_pending",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  const attempt = paymentAttemptRepo.create({
    id: "pay_webhook_01",
    idempotency_key: "idem_web_01",
    cart_id: "cart_01",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 12000,
    currency_code: "RUB",
    status: "pending",
    external_payment_id: "yoo_ext_100",
    created_at: new Date(),
    updated_at: new Date(),
  });

  const mockClient = new YooKassaClient("shop", "secret");
  let verifiedPaymentId: string | null = null;
  mockClient.getPayment = async (paymentId: string) => {
    verifiedPaymentId = paymentId;
    return {
      id: paymentId,
      status: "succeeded",
      paid: true,
      amount: { value: "120.00", currency: "RUB" },
      created_at: new Date().toISOString(),
    };
  };

  const result = await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    {
      provider_payment_id: "yoo_ext_100",
      event_type: "payment.succeeded",
    }
  );

  assert.strictEqual(verifiedPaymentId, "yoo_ext_100");
  assert.strictEqual(result.status, "converted");
  assert.strictEqual(result.payment_attempt.status, "succeeded");

  const updatedRes = await reservationRepo.findById(reservation.id);
  assert.strictEqual(updatedRes?.status, "converted");
  assert.ok(updatedRes?.converted_at);
});

test("processPaymentWebhookWorkflow throws error on amount mismatch", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reservationRepo.create({
    id: "res_webhook_02",
    variant_id: "var_02",
    cart_id: "cart_02",
    status: "payment_pending",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  paymentAttemptRepo.create({
    id: "pay_webhook_02",
    idempotency_key: "idem_web_02",
    cart_id: "cart_02",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 12000, // 120.00 RUB expected
    currency_code: "RUB",
    status: "pending",
    external_payment_id: "yoo_ext_200",
    created_at: new Date(),
    updated_at: new Date(),
  });

  const mockClient = new YooKassaClient("shop", "secret");
  mockClient.getPayment = async (paymentId: string) => ({
    id: paymentId,
    status: "succeeded",
    paid: true,
    amount: { value: "50.00", currency: "RUB" }, // Mismatch!
    created_at: new Date().toISOString(),
  });

  await assert.rejects(
    async () =>
      processPaymentWebhookWorkflow(
        reservationRepo,
        paymentAttemptRepo,
        mockClient,
        {
          provider_payment_id: "yoo_ext_200",
          event_type: "payment.succeeded",
        }
      ),
    /Payment amount\/currency mismatch/
  );
});

test("processPaymentWebhookWorkflow is duplicate-safe on repeated webhook calls", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reservationRepo.create({
    id: "res_webhook_03",
    variant_id: "var_03",
    cart_id: "cart_03",
    status: "payment_pending",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  paymentAttemptRepo.create({
    id: "pay_webhook_03",
    idempotency_key: "idem_web_03",
    cart_id: "cart_03",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 12000,
    currency_code: "RUB",
    status: "pending",
    external_payment_id: "yoo_ext_300",
    created_at: new Date(),
    updated_at: new Date(),
  });

  const mockClient = new YooKassaClient("shop", "secret");
  mockClient.getPayment = async (paymentId: string) => ({
    id: paymentId,
    status: "succeeded",
    paid: true,
    amount: { value: "120.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  // First webhook call
  await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    { provider_payment_id: "yoo_ext_300", event_type: "payment.succeeded" }
  );

  // Duplicate webhook call
  const secondResult = await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockClient,
    { provider_payment_id: "yoo_ext_300", event_type: "payment.succeeded" }
  );

  assert.strictEqual(secondResult.status, "already_processed");
});
