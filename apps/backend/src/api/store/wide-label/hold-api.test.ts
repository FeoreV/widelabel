import assert from "node:assert";
import test from "node:test";
import { GET as availabilityGET } from "./products/[id]/availability/route.ts";
import { POST as holdPOST } from "./cart/hold/route.ts";
import { InMemoryReservationRepository } from "../../../modules/wide-label/repositories/reservation-repository.ts";

function createMockResponse() {
  let statusCode = 0;
  let body: any = null;

  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      body = data;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
}

test("GET availability returns available when no reservation exists", async () => {
  const repo = new InMemoryReservationRepository();
  const req = {
    params: { id: "var_avail_01" },
    scope: { resolve: () => repo },
  } as any;
  const res = createMockResponse();

  await availabilityGET(req, res as any);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.variant_id, "var_avail_01");
  assert.strictEqual(res.body.status, "available");
  assert.strictEqual(res.body.reserved_until, null);
});

test("POST hold creates reservation and returns contract format", async () => {
  const repo = new InMemoryReservationRepository();
  const req = {
    body: {
      variant_id: "var_hold_01",
      cart_id: "cart_01",
    },
    scope: { resolve: () => repo },
  } as any;
  const res = createMockResponse();

  await holdPOST(req, res as any);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.variant_id, "var_hold_01");
  assert.strictEqual(res.body.cart_id, "cart_01");
  assert.ok(res.body.reservation_id);
  assert.ok(res.body.reserved_until);
  assert.ok(res.body.server_time);
});

test("POST hold returns 409 ITEM_HELD error contract when another customer holds variant", async () => {
  const repo = new InMemoryReservationRepository();
  const req1 = {
    body: {
      variant_id: "var_hold_02",
      cart_id: "cart_01",
    },
    scope: { resolve: () => repo },
  } as any;
  const res1 = createMockResponse();
  await holdPOST(req1, res1 as any);

  const req2 = {
    body: {
      variant_id: "var_hold_02",
      cart_id: "cart_02",
    },
    scope: { resolve: () => repo },
  } as any;
  const res2 = createMockResponse();
  await holdPOST(req2, res2 as any);

  assert.strictEqual(res2.statusCode, 409);
  assert.deepStrictEqual(res2.body, {
    code: "ITEM_HELD",
    message: "Item is temporarily reserved by another customer.",
    retryable: false,
  });
});

import { closePgPool } from "../../../infra/db.ts";
import { stopReservationQueueService } from "../../../jobs/bullmq-reservation-queue.ts";

test.after(async () => {
  await stopReservationQueueService();
  await closePgPool();
});


