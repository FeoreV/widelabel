import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { PostgresPaymentAttemptRepository } from "../src/modules/wide-label/models/payment-attempt.ts";
import { PostgresOrderSnapshotRepository } from "../src/modules/wide-label/models/order-snapshot.ts";
import { YooKassaClient } from "../src/integrations/yookassa/client.ts";
import { reserveVariantWorkflow } from "../src/modules/wide-label/domain-workflows/reserve-variant.ts";
import { initiatePaymentWorkflow } from "../src/modules/wide-label/domain-workflows/initiate-payment.ts";
import { processPaymentWebhookWorkflow } from "../src/modules/wide-label/domain-workflows/process-payment-webhook.ts";
import { createOrderSnapshotWorkflow } from "../src/modules/wide-label/domain-workflows/create-order-snapshot.ts";
import { getPgPool } from "../src/infra/db.ts";

test("P0-E Integration: Complete YooKassa payment reconciliation and idempotent order creation", async () => {
  const pool = getPgPool();
  const reservationRepo = new PostgresReservationRepository(pool);
  const paymentAttemptRepo = new PostgresPaymentAttemptRepository(pool);
  const snapshotRepo = new PostgresOrderSnapshotRepository(pool);
  const yookassaClient = new YooKassaClient("shop_prod_123", "secret_prod_456");

  const variantId = `var_yoo_rec_${Date.now()}`;
  const cartId = `cart_yoo_rec_${Date.now()}`;
  const idempotencyKey = `idem_yoo_rec_${Date.now()}`;
  const paymentId = `yoo_pay_${Date.now()}`;

  // 1. Create real reservation in PostgreSQL
  const reservation = await reserveVariantWorkflow(
    reservationRepo,
    { variant_id: variantId, cart_id: cartId },
    new Date()
  );
  assert.strictEqual(reservation.status, "active");

  // Mock YooKassa HTTP call
  yookassaClient.createPayment = async () => ({
    id: paymentId,
    status: "pending",
    paid: false,
    amount: { value: "24900.00", currency: "RUB" },
    confirmation: {
      type: "redirect",
      confirmation_url: `https://yookassa.ru/pay/${paymentId}`,
    },
    created_at: new Date().toISOString(),
  });

  // 2. Initiate Payment Workflow
  const attempt = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    yookassaClient,
    {
      cart_id: cartId,
      reservation_id: reservation.id,
      provider: "yookassa",
      amount: 2490000,
      currency_code: "RUB",
      idempotency_key: idempotencyKey,
      return_url: "https://wide-label.com/checkout/success",
    }
  );

  assert.strictEqual(attempt.payment_attempt.status, "pending");
  assert.strictEqual(attempt.payment_attempt.external_payment_id, paymentId);

  // Check reservation transitioned to payment_pending
  const pendingRes = await reservationRepo.findById(reservation.id);
  assert.strictEqual(pendingRes?.status, "payment_pending");

  // Mock YooKassa GET payment verification response
  yookassaClient.getPayment = async () => ({
    id: paymentId,
    status: "succeeded",
    paid: true,
    amount: { value: "24900.00", currency: "RUB" },
    metadata: { idempotency_key: idempotencyKey },
    created_at: new Date().toISOString(),
  });

  // 3. First Webhook Execution -> Must convert reservation & create order snapshot
  const webhook1 = await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    yookassaClient,
    {
      provider_payment_id: paymentId,
      event_type: "payment.succeeded",
    }
  );

  assert.strictEqual(webhook1.status, "converted");

  const convertedRes = await reservationRepo.findById(reservation.id);
  assert.strictEqual(convertedRes?.status, "converted");

  // Create immutable snapshot
  const mockCatalogProvider = {
    async getCanonicalVariantData(_vId: string) {
      return {
        title: "Archive Wool Coat",
        price: 2490000,
        currency_code: "RUB",
        measurements: { chest_cm: 58, length_cm: 115 },
        defects: [],
        media_checksums: { "coat.jpg": "sha256_abc123" },
      };
    },
  };

  const snapshot = await createOrderSnapshotWorkflow(
    snapshotRepo,
    mockCatalogProvider,
    {
      order_id: `ord_${Date.now()}`,
      variant_id: variantId,
      consent_version: "2026-01-v1",
    }
  );

  assert.ok(snapshot.id);

  // 4. Duplicate Webhook Execution -> Must be idempotent, no duplicate conversion
  const webhook2 = await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    yookassaClient,
    {
      provider_payment_id: paymentId,
      event_type: "payment.succeeded",
    }
  );

  assert.strictEqual(webhook2.status, "already_processed");

  // OrderSnapshot remains strictly immutable
  await assert.rejects(
    async () => snapshotRepo.update(),
    /OrderSnapshot is immutable/
  );
});

test("P0-E Integration: Webhook payload mismatch rejections", async () => {
  const pool = getPgPool();
  const reservationRepo = new PostgresReservationRepository(pool);
  const paymentAttemptRepo = new PostgresPaymentAttemptRepository(pool);
  const yookassaClient = new YooKassaClient("shop_prod_123", "secret_prod_456");

  const variantId = `var_yoo_reject_${Date.now()}`;
  const cartId = `cart_yoo_reject_${Date.now()}`;
  const idempotencyKey = `idem_yoo_reject_${Date.now()}`;
  const paymentId = `yoo_pay_reject_${Date.now()}`;

  const reservation = await reserveVariantWorkflow(
    reservationRepo,
    { variant_id: variantId, cart_id: cartId },
    new Date()
  );

  yookassaClient.createPayment = async () => ({
    id: paymentId,
    status: "pending",
    paid: false,
    amount: { value: "15000.00", currency: "RUB" },
    confirmation: {
      type: "redirect",
      confirmation_url: `https://yookassa.ru/pay/${paymentId}`,
    },
    created_at: new Date().toISOString(),
  });

  await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    yookassaClient,
    {
      cart_id: cartId,
      reservation_id: reservation.id,
      provider: "yookassa",
      amount: 1500000,
      currency_code: "RUB",
      idempotency_key: idempotencyKey,
      return_url: "https://wide-label.com/checkout/success",
    }
  );

  // YooKassa returns wrong amount (tampered or mismatch)
  yookassaClient.getPayment = async () => ({
    id: paymentId,
    status: "succeeded",
    paid: true,
    amount: { value: "1.00", currency: "RUB" },
    metadata: { idempotency_key: idempotencyKey },
    created_at: new Date().toISOString(),
  });

  await assert.rejects(
    async () =>
      processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, yookassaClient, {
        provider_payment_id: paymentId,
        event_type: "payment.succeeded",
      }),
    /Payment amount\/currency mismatch/
  );
});
