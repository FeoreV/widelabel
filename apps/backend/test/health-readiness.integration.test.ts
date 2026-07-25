import assert from "node:assert";
import test from "node:test";
import { GET as getHealth } from "../src/api/health/route.ts";
import { GET as getReady } from "../src/api/ready/route.ts";

test("Health & Readiness: liveness endpoint returns 200 OK live status", async () => {
  let statusCode = 0;
  let responseData: any = null;

  const req = {} as any;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  } as any;

  await getHealth(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.status, "ok");
});

import { closePgPool } from "../src/infra/db.ts";

test("Health & Readiness: readiness endpoint verifies PostgreSQL and Redis status", async () => {
  let statusCode = 0;
  let responseData: any = null;

  const req = {} as any;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  } as any;

  await getReady(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.status, "ready");
  assert.strictEqual(responseData.postgres, "ok");
  assert.strictEqual(responseData.redis, "ok");

  await closePgPool();
});

test.after(async () => {
  await closePgPool();
});

