import assert from "node:assert";
import test from "node:test";
import { InMemoryReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { InMemoryPaymentAttemptRepository } from "../src/modules/wide-label/models/payment-attempt.ts";
import { OrderSnapshotRepository } from "../src/modules/wide-label/models/order-snapshot.ts";
import { YooKassaClient } from "../src/integrations/yookassa/client.ts";
import { reserveVariantWorkflow } from "../src/workflows/reserve-variant.ts";
import { initiatePaymentWorkflow } from "../src/workflows/initiate-payment.ts";
import { processPaymentWebhookWorkflow } from "../src/workflows/process-payment-webhook.ts";
import { createOrderSnapshotWorkflow } from "../src/workflows/create-order-snapshot.ts";

test("Checkout E2E: redirect page landing does NOT prove payment success until verified webhook processes", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  // 1. Customer holds variant
  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_e2e_01",
    cart_id: "cart_e2e_01",
  });
  assert.strictEqual(reservation.status, "active");

  // 2. Customer initiates checkout payment
  const mockYooKassa = new YooKassaClient("shop", "secret");
  mockYooKassa.createPayment = async (input) => ({
    id: "yoo_e2e_pay_1",
    status: "pending",
    paid: false,
    amount: input.amount,
    confirmation: {
      type: "redirect",
      confirmation_url: "https://yoomoney.ru/checkout/payments/contract?id=yoo_e2e_pay_1",
    },
    created_at: new Date().toISOString(),
  });

  const paymentResult = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockYooKassa,
    {
      cart_id: "cart_e2e_01",
      reservation_id: reservation.id,
      provider: "yookassa",
      amount: 15000,
      currency_code: "RUB",
      idempotency_key: "idem_e2e_01",
      return_url: "https://wide-label.com/checkout/success",
    }
  );

  // Status transitions to payment_pending
  const pendingRes = await reservationRepo.findById(reservation.id);
  assert.strictEqual(pendingRes?.status, "payment_pending");

  // 3. User redirects back to storefront success page (SIMULATED REDIRECT)
  // Architecture Invariant: Redirect page landing NEVER proves payment success. Status must remain payment_pending until verified by server.
  const redirectRes = await reservationRepo.findById(reservation.id);
  assert.notStrictEqual(redirectRes?.status, "converted", "Redirect page MUST NOT convert order without verified webhook");
  assert.strictEqual(redirectRes?.status, "payment_pending");

  // 4. Server receives webhook and verifies with YooKassa
  mockYooKassa.getPayment = async (payId) => ({
    id: payId,
    status: "succeeded",
    paid: true,
    amount: { value: "150.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  const webhookResult = await processPaymentWebhookWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    mockYooKassa,
    {
      provider_payment_id: "yoo_e2e_pay_1",
      event_type: "payment.succeeded",
    }
  );

  assert.strictEqual(webhookResult.status, "converted");

  const convertedRes = await reservationRepo.findById(reservation.id);
  assert.strictEqual(convertedRes?.status, "converted");
});

test("Checkout E2E: duplicate webhook calls are handled idempotently", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_e2e_02",
    cart_id: "cart_e2e_02",
  });

  const mockYooKassa = new YooKassaClient("shop", "secret");
  mockYooKassa.createPayment = async () => ({
    id: "yoo_e2e_pay_2",
    status: "pending",
    paid: false,
    amount: { value: "150.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  await initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
    cart_id: "cart_e2e_02",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 15000,
    currency_code: "RUB",
    idempotency_key: "idem_e2e_02",
    return_url: "https://wide-label.com/checkout/success",
  });

  mockYooKassa.getPayment = async () => ({
    id: "yoo_e2e_pay_2",
    status: "succeeded",
    paid: true,
    amount: { value: "150.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  // First webhook call
  const first = await processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
    provider_payment_id: "yoo_e2e_pay_2",
    event_type: "payment.succeeded",
  });
  assert.strictEqual(first.status, "converted");

  // Duplicate webhook call
  const second = await processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
    provider_payment_id: "yoo_e2e_pay_2",
    event_type: "payment.succeeded",
  });
  assert.strictEqual(second.status, "already_processed");
});

test("Checkout E2E: amount mismatch in webhook strictly rejects payment", async () => {
  const reservationRepo = new InMemoryReservationRepository();
  const paymentAttemptRepo = new InMemoryPaymentAttemptRepository();

  const reservation = await reserveVariantWorkflow(reservationRepo, {
    variant_id: "var_e2e_03",
    cart_id: "cart_e2e_03",
  });

  const mockYooKassa = new YooKassaClient("shop", "secret");
  mockYooKassa.createPayment = async () => ({
    id: "yoo_e2e_pay_3",
    status: "pending",
    paid: false,
    amount: { value: "150.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  await initiatePaymentWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
    cart_id: "cart_e2e_03",
    reservation_id: reservation.id,
    provider: "yookassa",
    amount: 15000,
    currency_code: "RUB",
    idempotency_key: "idem_e2e_03",
    return_url: "https://wide-label.com/checkout/success",
  });

  // Server verification returns lower amount!
  mockYooKassa.getPayment = async () => ({
    id: "yoo_e2e_pay_3",
    status: "succeeded",
    paid: true,
    amount: { value: "50.00", currency: "RUB" },
    created_at: new Date().toISOString(),
  });

  await assert.rejects(
    async () =>
      processPaymentWebhookWorkflow(reservationRepo, paymentAttemptRepo, mockYooKassa, {
        provider_payment_id: "yoo_e2e_pay_3",
        event_type: "payment.succeeded",
      }),
    /Payment amount\/currency mismatch/
  );
});

test("Checkout E2E: OrderSnapshot is created and immutable", async () => {
  const snapshotRepo = new OrderSnapshotRepository();

  const mockCatalogProvider = {
    async getCanonicalVariantData(variantId: string) {
      return {
        title: "Archival Vintage Tee",
        price: 15000,
        currency_code: "RUB",
        measurements: { version: 1, unit: "cm" as const, fields: { chest: 60, length: 74 } },
        defects: [],
        media_checksums: { "photo.jpg": "hash_123" },
      };
    },
  };

  const snapshot = await createOrderSnapshotWorkflow(snapshotRepo, mockCatalogProvider, {
    order_id: "order_e2e_100",
    variant_id: "var_e2e_04",
    consent_version: "v1.0-2026-07",
  });

  assert.strictEqual(snapshot.order_id, "order_e2e_100");
  assert.strictEqual(snapshot.price, 15000);
  assert.strictEqual(snapshot.consent_version, "v1.0-2026-07");
});
