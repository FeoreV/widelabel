import assert from "node:assert";
import test from "node:test";
import { JoinWaitlistPayloadSchema, ApiWaitlistAdapter } from "../../lib/waitlist/adapter";
import { WaitlistForm } from "./waitlist-form";

test("JoinWaitlistPayloadSchema validates email and variantId", () => {
  const valid = JoinWaitlistPayloadSchema.parse({
    variant_id: "var_01",
    email: "test@example.com",
    channel: "email",
  });
  assert.strictEqual(valid.email, "test@example.com");

  assert.throws(() => {
    JoinWaitlistPayloadSchema.parse({
      variant_id: "var_01",
      email: "invalid-email",
    });
  });
});

test("WaitlistForm export exists and is a function component", () => {
  assert.strictEqual(typeof WaitlistForm, "function");
});

test("ApiWaitlistAdapter handles mock fetch call", async () => {
  const mockFetch = async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    return new Response(
      JSON.stringify({ success: true, message: "Added to waitlist", waitlist_id: "wl_01" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };
  globalThis.fetch = mockFetch as any;

  const adapter = new ApiWaitlistAdapter("http://localhost:9000");
  const res = await adapter.joinWaitlist({
    variant_id: "var_01",
    email: "user@example.com",
    channel: "email",
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.waitlist_id, "wl_01");
});
