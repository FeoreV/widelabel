import assert from "node:assert";
import test from "node:test";
import {
  ConsentValidationService,
  InvalidConsentError,
} from "./consent-validation.service.ts";

test("ConsentValidationService records valid consent", () => {
  const service = new ConsentValidationService();
  const record = service.validateAndRecord({
    terms_accepted: true,
    privacy_accepted: true,
    consent_version: "v1.0-2026-07",
  });

  assert.strictEqual(record.consent_version, "v1.0-2026-07");
  assert.ok(record.accepted_at);
  assert.ok(record.consent_hash);
});

test("ConsentValidationService throws on missing terms acceptance", () => {
  const service = new ConsentValidationService();
  assert.throws(
    () =>
      service.validateAndRecord({
        terms_accepted: false,
        privacy_accepted: true,
        consent_version: "v1.0-2026-07",
      }),
    InvalidConsentError
  );
});

test("ConsentValidationService throws on stale consent version", () => {
  const service = new ConsentValidationService();
  assert.throws(
    () =>
      service.validateAndRecord({
        terms_accepted: true,
        privacy_accepted: true,
        consent_version: "v0.9-stale",
      }),
    InvalidConsentError
  );
});
