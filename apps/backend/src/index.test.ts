import assert from "node:assert";
import test from "node:test";
import { getBackendStatus } from "./index.ts";
import { GET } from "./api/health/route.ts";

test("getBackendStatus returns ok", () => {
  const status = getBackendStatus();
  assert.strictEqual(status.status, "ok");
});

test("health GET route responds with status ok", async () => {
  let statusCode = 0;
  let responseData: unknown = null;
  const mockRes = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: unknown) {
      responseData = data;
      return this;
    },
  };

  await GET({} as any, mockRes as any);
  assert.strictEqual(statusCode, 200);
  assert.deepStrictEqual(responseData, { status: "ok" });
});
