import assert from "node:assert";
import test from "node:test";
import { parseCartCookie, formatCartCookie } from "../cart/cart-cookie";
import { MedusaStorefrontClient, MedusaClientError } from "./client";

test("parseCartCookie extracts opaque cart id from header", () => {
  const header = "other_cookie=123; _wl_cart_id=cart_01JXYZ; theme=dark";
  const cartId = parseCartCookie(header);
  assert.strictEqual(cartId, "cart_01JXYZ");
});

test("formatCartCookie generates secure HttpOnly cookie header", () => {
  const cookieStr = formatCartCookie("cart_01JXYZ");
  assert.ok(cookieStr.includes("_wl_cart_id=cart_01JXYZ"));
  assert.ok(cookieStr.includes("HttpOnly"));
  assert.ok(cookieStr.includes("SameSite=Lax"));
});

test("MedusaStorefrontClient handles successful API calls and maps error contract", async () => {
  const mockFetch = async (input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const urlStr = input.toString();
    if (urlStr.includes("/availability")) {
      return new Response(
        JSON.stringify({
          variant_id: "var_01",
          status: "available",
          reserved_until: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (urlStr.includes("/hold")) {
      return new Response(
        JSON.stringify({
          code: "ITEM_HELD",
          message: "Item is temporarily reserved by another customer.",
          retryable: false,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response("Not found", { status: 404 });
  };

  globalThis.fetch = mockFetch as any;

  const client = new MedusaStorefrontClient("http://localhost:9000");

  const avail = await client.getAvailability("var_01");
  assert.strictEqual(avail.status, "available");

  await assert.rejects(
    async () => client.holdCartItem({ variant_id: "var_01", cart_id: "cart_02" }),
    (err: any) => {
      assert.ok(err instanceof MedusaClientError);
      assert.strictEqual(err.code, "ITEM_HELD");
      assert.strictEqual(err.retryable, false);
      return true;
    }
  );
});
