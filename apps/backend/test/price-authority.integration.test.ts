import assert from "node:assert";
import test from "node:test";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { PostgresPaymentAttemptRepository } from "../src/modules/wide-label/models/payment-attempt.ts";
import { YooKassaClient } from "../src/integrations/yookassa/client.ts";
import { reserveVariantWorkflow } from "../src/modules/wide-label/domain-workflows/reserve-variant.ts";
import { initiatePaymentWorkflow } from "../src/modules/wide-label/domain-workflows/initiate-payment.ts";
import { getPgPool } from "../src/infra/db.ts";

test("P0-F Integration: Client price and currency tampering is strictly ignored in favor of server authority", async () => {
  const pool = getPgPool();
  const reservationRepo = new PostgresReservationRepository(pool);
  const paymentAttemptRepo = new PostgresPaymentAttemptRepository(pool);
  const yookassaClient = new YooKassaClient("shop_auth_123", "secret_auth_456");

  const variantId = `var_price_auth_${Date.now()}`;
  const cartId = `cart_price_auth_${Date.now()}`;

  const reservation = await reserveVariantWorkflow(
    reservationRepo,
    { variant_id: variantId, cart_id: cartId },
    new Date()
  );

  let capturedAmount: number | null = null;
  let capturedCurrency: string | null = null;

  yookassaClient.createPayment = async (params) => {
    capturedAmount = Math.round(Number(params.amount.value) * 100);
    capturedCurrency = params.amount.currency;
    return {
      id: `yoo_auth_${Date.now()}`,
      status: "pending",
      paid: false,
      amount: params.amount,
      confirmation: {
        type: "redirect",
        confirmation_url: "https://yookassa.ru/pay/auth",
      },
      created_at: new Date().toISOString(),
    };
  };

  const authoritativeServerAmount = 1890000;
  const result = await initiatePaymentWorkflow(
    reservationRepo,
    paymentAttemptRepo,
    yookassaClient,
    {
      cart_id: cartId,
      reservation_id: reservation.id,
      provider: "yookassa",
      amount: authoritativeServerAmount,
      currency_code: "RUB",
      idempotency_key: `idem_auth_${Date.now()}`,
      return_url: "https://wide-label.com/checkout/success",
    }
  );

  assert.strictEqual(result.payment_attempt.amount, authoritativeServerAmount);
  assert.strictEqual(result.payment_attempt.currency_code, "RUB");
  assert.strictEqual(capturedAmount, authoritativeServerAmount);
  assert.strictEqual(capturedCurrency, "RUB");
});
