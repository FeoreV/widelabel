import assert from "node:assert";
import test from "node:test";
import { config, parseEnv } from "./index.js";

test("config has default env", () => {
  assert.ok(config.env);
});

test("parseEnv parses environment variables with defaults", () => {
  const env = parseEnv({ NODE_ENV: "test" });
  assert.strictEqual(env.NODE_ENV, "test");
  assert.strictEqual(env.PORT, "9000");
});
