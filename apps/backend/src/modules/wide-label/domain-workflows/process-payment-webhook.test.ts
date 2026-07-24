import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../repositories/reservation-repository.ts";
import { InMemoryPaymentAttemptRepository } from "../models/payment-attempt.ts";
import { YooKassaClient } from "../../../integrations/yookassa/client.ts";
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
    { event_type: "payment.succeeded", provider_payment_id: "yoo_ext_100" }
  );

  assert.strictEqual(verifiedPaymentId, "yoo_ext_100");
  assert.strictEqual(result.payment_attempt.status, "succeeded");

  const updatedReservation = await reservationRepo.findById(reservation.id);
  assert.strictEqual(updatedReservation?.status, "converted");
});
