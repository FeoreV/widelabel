import assert from "node:assert";
import test from "node:test";
import {
  InMemoryWaitlistRepository,
  normalizeEmail,
  normalizeTelegramHandle,
} from "./waitlist.ts";

test("normalizeEmail and normalizeTelegramHandle clean inputs", () => {
  assert.strictEqual(normalizeEmail("  USER@Example.COM  "), "user@example.com");
  assert.strictEqual(normalizeTelegramHandle(" @some_handle "), "some_handle");
});

test("InMemoryWaitlistRepository creates entry and deduplicates repeat submissions", async () => {
  const repo = new InMemoryWaitlistRepository();

  const entry1 = await repo.create({
    variant_id: "var_wl_01",
    email: "  customer@domain.com ",
    channel: "email",
    consent_version: "v1.0",
  });

  assert.strictEqual(entry1.email, "customer@domain.com");

  const entry2 = await repo.create({
    variant_id: "var_wl_01",
    email: "CUSTOMER@DOMAIN.COM",
    channel: "email",
    consent_version: "v1.0",
  });

  assert.strictEqual(entry2.id, entry1.id, "Deduplicated repeat submission must return existing entry");

  const active = await repo.findActiveByVariant("var_wl_01");
  assert.strictEqual(active.length, 1);
});

test("InMemoryWaitlistRepository requires consent version", async () => {
  const repo = new InMemoryWaitlistRepository();

  await assert.rejects(
    async () =>
      repo.create({
        variant_id: "var_wl_02",
        email: "test@domain.com",
        channel: "email",
        consent_version: "",
      }),
    /Consent version is required/
  );
});
