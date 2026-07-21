import assert from "node:assert";
import test from "node:test";
import { CdekAuthClient } from "./auth.ts";
import { CdekStatusAdapter } from "./status.ts";

test("CdekStatusAdapter maps CDEK status codes accurately", () => {
  const authClient = new CdekAuthClient("id", "secret");
  const adapter = new CdekStatusAdapter(authClient);

  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("CREATED"), "created");
  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("ACCEPTED_AT_STOCK"), "in_transit");
  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("ACCEPTED_AT_PICK_UP_POINT"), "ready_for_pickup");
  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("DELIVERED"), "delivered");
  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("RETURNED"), "failed");
  assert.strictEqual(adapter.mapCdekStatusToFulfillmentStatus("CANCELED"), "canceled");
});

test("CdekStatusAdapter polls shipment status from CDEK API", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_auth_token_789",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/orders/cdek_uuid_9999")) {
        return new Response(
          JSON.stringify({
            entity: {
              uuid: "cdek_uuid_9999",
              statuses: [
                { code: "ACCEPTED", name: "Принят", date_time: "2026-07-21T10:00:00+03:00" },
                { code: "ACCEPTED_AT_PICK_UP_POINT", name: "В ПВЗ", date_time: "2026-07-21T11:00:00+03:00" },
              ],
            },
          }),
          { status: 200 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const statusAdapter = new CdekStatusAdapter(authClient);

    const info = await statusAdapter.getShipmentStatus("cdek_uuid_9999");
    assert.strictEqual(info.cdek_order_uuid, "cdek_uuid_9999");
    assert.strictEqual(info.cdek_status_code, "ACCEPTED_AT_PICK_UP_POINT");
    assert.strictEqual(info.fulfillment_status, "ready_for_pickup");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
