import assert from "node:assert";
import test from "node:test";
import { CdekAuthClient } from "./auth.ts";
import { CdekFulfillmentAdapter } from "./fulfillment.ts";

test("CdekFulfillmentAdapter creates CDEK shipment order via API", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_auth_token_456",
            token_type: "bearer",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/orders")) {
        assert.strictEqual(init?.method, "POST");
        const headers = init?.headers as Record<string, string>;
        assert.strictEqual(headers["Authorization"], "Bearer cdek_auth_token_456");

        const body = JSON.parse(init?.body as string);
        assert.strictEqual(body.number, "ORD_1001");
        assert.strictEqual(body.recipient.name, "Alex Ivan");

        return new Response(
          JSON.stringify({
            entity: { uuid: "cdek_uuid_9999" },
            requests: [{ request_uuid: "req_001", type: "CREATE", state: "ACCEPTED" }],
          }),
          { status: 202 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const fulfillmentAdapter = new CdekFulfillmentAdapter(authClient);

    const result = await fulfillmentAdapter.createShipmentOrder({
      order_number: "ORD_1001",
      tariff_code: 136,
      sender: { name: "WIDE LABEL HQ", phone: "+79990000000" },
      recipient: { name: "Alex Ivan", phone: "+79991112233" },
      from_location: { postal_code: "101000" },
      to_location: { postal_code: "190000" },
      packages: [{ weight: 800 }],
    });

    assert.strictEqual(result.cdek_order_uuid, "cdek_uuid_9999");
    assert.strictEqual(result.order_number, "ORD_1001");
    assert.strictEqual(result.status, "ACCEPTED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("CdekFulfillmentAdapter is idempotent on repeated shipment creation", async () => {
  const originalFetch = globalThis.fetch;
  let orderCallCount = 0;

  try {
    globalThis.fetch = async (url: RequestInfo | URL) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_token",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/orders")) {
        orderCallCount++;
        return new Response(
          JSON.stringify({
            entity: { uuid: "cdek_uuid_idem_777" },
          }),
          { status: 202 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const fulfillmentAdapter = new CdekFulfillmentAdapter(authClient);

    const input = {
      order_number: "ORD_IDEM_555",
      tariff_code: 136,
      sender: { name: "WIDE LABEL HQ", phone: "+79990000000" },
      recipient: { name: "Alex Ivan", phone: "+79991112233" },
      from_location: { postal_code: "101000" },
      to_location: { postal_code: "190000" },
      packages: [{ weight: 800 }],
    };

    const first = await fulfillmentAdapter.createShipmentOrder(input);
    const second = await fulfillmentAdapter.createShipmentOrder(input);

    assert.strictEqual(orderCallCount, 1, "CDEK API MUST NOT be called again for same order_number");
    assert.strictEqual(second.cdek_order_uuid, first.cdek_order_uuid);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
