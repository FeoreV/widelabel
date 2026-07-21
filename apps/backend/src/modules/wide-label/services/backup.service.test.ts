import assert from "node:assert";
import test from "node:test";
import {
  BackupService,
  BackupEncryptionError,
  BackupChecksumError,
  encryptBackup,
  decryptBackup,
  computeChecksum,
} from "./backup.service.ts";

const STRONG_KEY = "wide-label-backup-encryption-key-2026";

test("BackupService creates encrypted backup and restores with checksum verification", () => {
  const service = new BackupService(STRONG_KEY);
  const data = Buffer.from(
    JSON.stringify({ reservations: [{ id: "res_001", variant_id: "var_abc", status: "converted" }] })
  );

  const manifest = service.createBackup(["reservations", "order_snapshots"], data);

  assert.ok(manifest.backup_id.startsWith("bkp_"));
  assert.strictEqual(manifest.encrypted, true);
  assert.strictEqual(typeof manifest.checksum_sha256, "string");
  assert.strictEqual(manifest.tables.length, 2);

  const result = service.restoreBackup(manifest.backup_id);
  assert.strictEqual(result.backup_id, manifest.backup_id);
  assert.strictEqual(result.checksum_verified, true);
  assert.deepStrictEqual(result.tables_restored, ["reservations", "order_snapshots"]);
});

test("encryptBackup + decryptBackup round-trip preserves data integrity", () => {
  const original = Buffer.from("SELECT * FROM drops WHERE status = 'published';");
  const ciphertext = encryptBackup(original, STRONG_KEY);
  const restored = decryptBackup(ciphertext, STRONG_KEY);

  assert.ok(!original.equals(ciphertext), "Ciphertext must differ from plaintext");
  assert.ok(original.equals(restored), "Restored data must exactly match original");
});

test("decryptBackup with wrong key throws authentication error", () => {
  const original = Buffer.from("secret schema dump");
  const ciphertext = encryptBackup(original, STRONG_KEY);

  assert.throws(
    () => decryptBackup(ciphertext, "wrong-key-that-does-not-match"),
    /ERR_OSSL|authentication|Unsupported state|bad decrypt/i
  );
});

test("encryptBackup throws BackupEncryptionError when key is too short", () => {
  assert.throws(
    () => encryptBackup(Buffer.from("data"), "short"),
    BackupEncryptionError
  );
});

test("computeChecksum returns stable SHA-256 hex for same input", () => {
  const data = Buffer.from("stable data");
  const hash1 = computeChecksum(data);
  const hash2 = computeChecksum(data);
  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 64); // SHA-256 hex = 64 chars
});
