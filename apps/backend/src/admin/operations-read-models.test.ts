import assert from "node:assert";
import test from "node:test";
import { OperationsReadModelsService } from "./operations-read-models.ts";

test("OperationsReadModelsService tracks active holds and expiring holds", () => {
  const service = new OperationsReadModelsService();
  const now = new Date("2026-07-21T12:00:00Z");

  // Hold 1: expires in 2 mins
  service.recordHold("h1", "var_1", new Date("2026-07-21T12:02:00Z"));
  // Hold 2: expires in 10 mins
  service.recordHold("h2", "var_2", new Date("2026-07-21T12:10:00Z"));
  // Hold 3: already expired
  service.recordHold("h3", "var_3", new Date("2026-07-21T11:59:00Z"));

  const metrics = service.getActiveHoldsMetrics(now);
  assert.strictEqual(metrics.total_active_holds, 2);
  assert.strictEqual(metrics.holds_expiring_soon, 1);
  assert.strictEqual(metrics.reserved_variants_count, 2);
});

test("OperationsReadModelsService tracks payment failures and shipment failures", () => {
  const service = new OperationsReadModelsService();

  service.recordPaymentFailure({
    id: "pay_err_01",
    cart_id: "cart_01",
    reservation_id: "res_01",
    provider: "yookassa",
    amount: 15000,
    status: "failed",
    error_message: "Insufficient funds",
    created_at: new Date(),
  });

  service.recordShipmentFailure({
    order_number: "ORD_999",
    error_reason: "Recipient address invalid",
    failed_at: new Date(),
  });

  const paymentErrors = service.getPaymentFailures();
  assert.strictEqual(paymentErrors.length, 1);
  assert.strictEqual(paymentErrors[0].error_message, "Insufficient funds");

  const shipmentErrors = service.getShipmentFailures();
  assert.strictEqual(shipmentErrors.length, 1);
  assert.strictEqual(shipmentErrors[0].order_number, "ORD_999");
});

test("OperationsReadModelsService calculates webhook processing lag metrics", () => {
  const service = new OperationsReadModelsService();

  service.recordWebhookProcessingLag(120);
  service.recordWebhookProcessingLag(300);
  service.recordWebhookProcessingLag(180);

  const lag = service.getWebhookLagMetrics();
  assert.strictEqual(lag.total_webhooks_processed, 3);
  assert.strictEqual(lag.avg_lag_ms, 200);
  assert.strictEqual(lag.max_lag_ms, 300);
});
