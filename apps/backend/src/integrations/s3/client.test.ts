import assert from "node:assert";
import test from "node:test";
import { S3StorageAdapter } from "./client.ts";

test("S3StorageAdapter generates presigned upload url and public url", async () => {
  const adapter = new S3StorageAdapter({
    endpoint: "http://localhost:9000",
    bucket: "test-bucket",
    accessKeyId: "testkey",
    secretAccessKey: "testsecret",
  });

  const result = await adapter.getPresignedUploadUrl(
    "products/cover.jpg",
    "image/jpeg",
    600
  );

  assert.ok(result.uploadUrl.includes("http://localhost:9000/test-bucket/products/cover.jpg"));
  assert.strictEqual(result.key, "products/cover.jpg");
  assert.strictEqual(
    result.publicUrl,
    "http://localhost:9000/test-bucket/products/cover.jpg"
  );
});
