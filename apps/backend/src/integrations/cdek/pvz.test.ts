import assert from "node:assert";
import test from "node:test";
import { CdekAuthClient } from "./auth.ts";
import { CdekPvzAdapter } from "./pvz.ts";

test("CdekPvzAdapter queries PVZ list by city code", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_auth_token_123",
            token_type: "bearer",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/deliverypoints?city_code=44")) {
        return new Response(
          JSON.stringify([
            {
              code: "MSK10",
              name: "PVZ Tverskaya",
              location: {
                city_code: 44,
                city: "Moscow",
                address: "Tverskaya St 12",
                postal_code: "101000",
              },
              work_time: "Mon-Sun 09:00-21:00",
              phones: [{ number: "+74951234567" }],
            },
          ]),
          { status: 200 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const pvzAdapter = new CdekPvzAdapter(authClient);

    const points = await pvzAdapter.getPvzsByCity(44);
    assert.strictEqual(points.length, 1);
    assert.strictEqual(points[0].code, "MSK10");
    assert.strictEqual(points[0].name, "PVZ Tverskaya");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("CdekPvzAdapter validates PVZ code and creates destination snapshot", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_auth_token_123",
            token_type: "bearer",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/deliverypoints?code=MSK10")) {
        return new Response(
          JSON.stringify([
            {
              code: "MSK10",
              name: "PVZ Tverskaya",
              location: {
                city_code: 44,
                city: "Moscow",
                address: "Tverskaya St 12",
                postal_code: "101000",
              },
              work_time: "Mon-Sun 09:00-21:00",
              phones: [{ number: "+74951234567" }],
            },
          ]),
          { status: 200 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const pvzAdapter = new CdekPvzAdapter(authClient);

    const snapshot = await pvzAdapter.createPvzDestinationSnapshot("MSK10");
    assert.strictEqual(snapshot.pvz_code, "MSK10");
    assert.strictEqual(snapshot.city, "Moscow");
    assert.strictEqual(snapshot.address, "Tverskaya St 12");
    assert.strictEqual(snapshot.phone, "+74951234567");
    assert.ok(snapshot.snapshot_at);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
