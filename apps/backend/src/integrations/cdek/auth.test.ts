import assert from "node:assert";
import test from "node:test";
import { CdekAuthClient } from "./auth.ts";

test("CdekAuthClient fetches token via OAuth2 and caches token", async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      callCount++;
      assert.strictEqual(url.toString(), "https://api.cdek.ru/v2/oauth/token");
      assert.strictEqual(init?.method, "POST");

      const bodyStr = init?.body as string;
      assert.ok(bodyStr.includes("grant_type=client_credentials"));
      assert.ok(bodyStr.includes("client_id=cdek_test_id"));

      return new Response(
        JSON.stringify({
          access_token: "cdek_bearer_token_12345",
          token_type: "bearer",
          expires_in: 3600,
          scope: "global",
          jti: "jwt_id_100",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new CdekAuthClient("cdek_test_id", "cdek_test_secret");

    const token1 = await client.getAccessToken();
    assert.strictEqual(token1, "cdek_bearer_token_12345");

    // Second call must return cached token without fetch
    const token2 = await client.getAccessToken();
    assert.strictEqual(token2, "cdek_bearer_token_12345");
    assert.strictEqual(callCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("CdekAuthClient refreshes token when cache is cleared or expired", async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  try {
    globalThis.fetch = async () => {
      callCount++;
      return new Response(
        JSON.stringify({
          access_token: `cdek_token_${callCount}`,
          token_type: "bearer",
          expires_in: 3600,
          scope: "global",
          jti: "jwt_id_100",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const client = new CdekAuthClient("cdek_id", "cdek_secret");
    const t1 = await client.getAccessToken();
    assert.strictEqual(t1, "cdek_token_1");

    client.clearCache();
    const t2 = await client.getAccessToken();
    assert.strictEqual(t2, "cdek_token_2");
    assert.strictEqual(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
