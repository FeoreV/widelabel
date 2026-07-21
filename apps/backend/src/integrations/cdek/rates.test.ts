import assert from "node:assert";
import test from "node:test";
import { CdekAuthClient } from "./auth.ts";
import { CdekRateAdapter } from "./rates.ts";

test("CdekRateAdapter calculates tariff rate with valid Bearer token", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const strUrl = url.toString();
      if (strUrl.includes("/v2/oauth/token")) {
        return new Response(
          JSON.stringify({
            access_token: "cdek_auth_token_xyz",
            token_type: "bearer",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (strUrl.includes("/v2/calculator/tariff")) {
        assert.strictEqual(init?.method, "POST");
        const headers = init?.headers as Record<string, string>;
        assert.strictEqual(headers["Authorization"], "Bearer cdek_auth_token_xyz");

        return new Response(
          JSON.stringify({
            delivery_sum: 350,
            period_min: 2,
            period_max: 3,
            weight_calc: 500,
            total_sum: 350,
            currency: "RUB",
          }),
          { status: 200 }
        );
      }

      throw new Error(`Unexpected URL: ${strUrl}`);
    };

    const authClient = new CdekAuthClient("cdek_id", "cdek_secret");
    const rateAdapter = new CdekRateAdapter(authClient);

    const rate = await rateAdapter.calculateRate({
      tariff_code: 136,
      from_location: { postal_code: "101000" },
      to_location: { postal_code: "190000" },
      packages: [{ weight: 500, length: 30, width: 20, height: 10 }],
    });

    assert.strictEqual(rate.delivery_sum, 350);
    assert.strictEqual(rate.period_min, 2);
    assert.strictEqual(rate.period_max, 3);
    assert.strictEqual(rate.currency, "RUB");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
