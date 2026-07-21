import assert from "node:assert";
import test from "node:test";
import { ObservabilityService, sanitizeAttributes } from "./observability.service.ts";

test("sanitizeAttributes redacts secrets, payment fields and tokens", () => {
  const raw = {
    reservation_id: "res_001",
    variant_id: "var_abc",
    api_key: "sk-prod-super-secret",
    token: "bearer_abcdef",
    email: "customer@example.com",
    amount: 15000,
    payment_id: "pay_xyz",
    status: "active",
    latency_ms: 42,
    success: true,
  };

  const sanitized = sanitizeAttributes(raw);

  assert.strictEqual(sanitized["reservation_id"], "res_001");
  assert.strictEqual(sanitized["variant_id"], "var_abc");
  assert.strictEqual(sanitized["status"], "active");
  assert.strictEqual(sanitized["latency_ms"], 42);
  assert.strictEqual(sanitized["success"], true);

  // All sensitive fields MUST be redacted
  assert.strictEqual(sanitized["api_key"], "[REDACTED]");
  assert.strictEqual(sanitized["token"], "[REDACTED]");
  assert.strictEqual(sanitized["email"], "[REDACTED]");
  assert.strictEqual(sanitized["amount"], "[REDACTED]");
  assert.strictEqual(sanitized["payment_id"], "[REDACTED]");
});

test("ObservabilityService tracks span lifecycle and latency", async () => {
  const obs = new ObservabilityService();
  const { traceId, spanId } = obs.startTrace("reserve_variant");

  assert.ok(traceId.startsWith("tr_"));
  assert.ok(spanId.startsWith("sp_"));

  await new Promise((r) => setTimeout(r, 10));
  obs.endSpan(spanId, "ok", { reservation_id: "res_001", variant_id: "var_001" });

  const latency = obs.getSpanLatencyMs(spanId);
  assert.ok(latency !== null && latency >= 10, "Span latency must be >= 10ms");

  const span = obs.getSpan(spanId);
  assert.strictEqual(span?.status, "ok");
  assert.strictEqual(span?.operation, "reserve_variant");
});

test("ObservabilityService records error report without leaking payment data", () => {
  const obs = new ObservabilityService();
  const { traceId, spanId } = obs.startTrace("initiate_payment");

  const err = Object.assign(new Error("Card declined"), { code: "PAYMENT_DECLINED" });
  obs.recordError(spanId, err, {
    reservation_id: "res_002",
    amount: 50000,
    currency: "RUB",
    external_payment_id: "yoo_pay_abc123",
  });

  const span = obs.getSpan(spanId);
  assert.strictEqual(span?.status, "error");
  assert.strictEqual(span?.errorCode, "PAYMENT_DECLINED");

  // Payment data must be redacted in span attributes
  assert.strictEqual(span?.attributes["amount"], "[REDACTED]");
  assert.strictEqual(span?.attributes["external_payment_id"], "[REDACTED]");
  // Safe field preserved
  assert.strictEqual(span?.attributes["reservation_id"], "res_002");

  const reports = obs.getErrorReports();
  assert.strictEqual(reports.length, 1);
  assert.strictEqual(reports[0].errorCode, "PAYMENT_DECLINED");
  assert.strictEqual(reports[0].traceId, traceId);
});
