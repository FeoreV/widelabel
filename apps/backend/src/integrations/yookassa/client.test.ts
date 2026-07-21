import assert from "node:assert";
import test from "node:test";
import { YooKassaClient } from "./client.ts";

test("YooKassaClient createPayment calls API with correct parameters and headers", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      assert.strictEqual(url.toString(), "https://api.yookassa.ru/v3/payments");
      assert.strictEqual(init?.method, "POST");

      const headers = init?.headers as Record<string, string>;
      assert.strictEqual(headers["Idempotency-Key"], "idem_yoo_123");
      assert.ok(headers["Authorization"].startsWith("Basic "));

      const body = JSON.parse(init?.body as string);
      assert.strictEqual(body.amount.value, "120.00");
      assert.strictEqual(body.amount.currency, "RUB");

      return new Response(
        JSON.stringify({
          id: "22d30793-000f-5000-8000-18db351245c7",
          status: "pending",
          paid: false,
          amount: { value: "120.00", currency: "RUB" },
          confirmation: {
            type: "redirect",
            confirmation_url: "https://yoomoney.ru/checkout/payments/v2/contract?orderId=22d30793",
          },
          created_at: "2026-07-21T10:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new YooKassaClient("shop_123", "secret_abc", "https://api.yookassa.ru/v3");
    const payment = await client.createPayment({
      amount: { value: "120.00", currency: "RUB" },
      confirmation: { type: "redirect", return_url: "https://example.com/return" },
      capture: true,
      idempotency_key: "idem_yoo_123",
    });

    assert.strictEqual(payment.id, "22d30793-000f-5000-8000-18db351245c7");
    assert.strictEqual(payment.status, "pending");
    assert.ok(payment.confirmation?.confirmation_url);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("YooKassaClient getPayment retrieves payment status", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: RequestInfo | URL) => {
      assert.strictEqual(url.toString(), "https://api.yookassa.ru/v3/payments/pay_999");
      return new Response(
        JSON.stringify({
          id: "pay_999",
          status: "succeeded",
          paid: true,
          amount: { value: "120.00", currency: "RUB" },
          created_at: "2026-07-21T10:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new YooKassaClient("shop_123", "secret_abc", "https://api.yookassa.ru/v3");
    const payment = await client.getPayment("pay_999");

    assert.strictEqual(payment.id, "pay_999");
    assert.strictEqual(payment.status, "succeeded");
    assert.strictEqual(payment.paid, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("YooKassaClient capturePayment, cancelPayment, and refundPayment", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const strUrl = url.toString();
      if (strUrl.includes("/capture")) {
        return new Response(
          JSON.stringify({
            id: "pay_999",
            status: "succeeded",
            paid: true,
            amount: { value: "120.00", currency: "RUB" },
            created_at: "2026-07-21T10:00:00.000Z",
          }),
          { status: 200 }
        );
      } else if (strUrl.includes("/cancel")) {
        return new Response(
          JSON.stringify({
            id: "pay_999",
            status: "canceled",
            paid: false,
            amount: { value: "120.00", currency: "RUB" },
            created_at: "2026-07-21T10:00:00.000Z",
          }),
          { status: 200 }
        );
      } else if (strUrl.includes("/refunds")) {
        return new Response(
          JSON.stringify({
            id: "ref_111",
            payment_id: "pay_999",
            status: "succeeded",
            amount: { value: "120.00", currency: "RUB" },
            created_at: "2026-07-21T10:00:00.000Z",
          }),
          { status: 200 }
        );
      }
      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const client = new YooKassaClient("shop_123", "secret_abc", "https://api.yookassa.ru/v3");

    const captured = await client.capturePayment("pay_999");
    assert.strictEqual(captured.status, "succeeded");

    const canceled = await client.cancelPayment("pay_999");
    assert.strictEqual(canceled.status, "canceled");

    const refunded = await client.refundPayment("pay_999", { value: "120.00", currency: "RUB" });
    assert.strictEqual(refunded.id, "ref_111");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
