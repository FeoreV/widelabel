import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
export class BackupEncryptionError extends Error {
    code = "BACKUP_ENCRYPTION_ERROR";
    constructor(message) {
        super(message);
        this.name = "BackupEncryptionError";
    }
}
export class BackupChecksumError extends Error {
    code = "BACKUP_CHECKSUM_MISMATCH";
    constructor(backupId) {
        super(`Checksum mismatch for backup ${backupId}. Backup may be corrupted or tampered.`);
        this.name = "BackupChecksumError";
    }
}
function deriveKey(secret) {
    // Deterministic key derivation from secret (PBKDF2-like, simplified for rehearsal)
    return createHash("sha256").update(secret).digest();
}
export function encryptBackup(plaintext, encryptionKey) {
    if (!encryptionKey || encryptionKey.length < 16) {
        throw new BackupEncryptionError("BACKUP_ENCRYPTION_KEY must be at least 16 characters");
    }
    const key = deriveKey(encryptionKey);
    const iv = randomBytes(12); // 96-bit IV for AES-256-GCM
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Format: [iv(12)] [authTag(16)] [ciphertext]
    return Buffer.concat([iv, authTag, encrypted]);
}
export function decryptBackup(ciphertext, encryptionKey) {
    if (!encryptionKey || encryptionKey.length < 16) {
        throw new BackupEncryptionError("BACKUP_ENCRYPTION_KEY must be at least 16 characters");
    }
    if (ciphertext.length < 28) {
        throw new BackupEncryptionError("Ciphertext too short; may be corrupted");
    }
    const key = deriveKey(encryptionKey);
    const iv = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(12, 28);
    const data = ciphertext.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
export function computeChecksum(data) {
    return createHash("sha256").update(data).digest("hex");
}
export class BackupService {
    encryptionKey;
    storedBackups = new Map();
    constructor(encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || "") {
        this.encryptionKey = encryptionKey;
    }
    createBackup(tables, data) {
        const backup_id = `bkp_${Date.now()}_${randomBytes(4).toString("hex")}`;
        const checksum_sha256 = computeChecksum(data);
        const ciphertext = encryptBackup(data, this.encryptionKey);
        const manifest = {
            backup_id,
            created_at: new Date(),
            checksum_sha256,
            tables,
            size_bytes: ciphertext.length,
            encrypted: true,
        };
        this.storedBackups.set(backup_id, { ciphertext, manifest });
        return manifest;
    }
    restoreBackup(backup_id) {
        const entry = this.storedBackups.get(backup_id);
        if (!entry) {
            throw new Error(`Backup ${backup_id} not found`);
        }
        const plaintext = decryptBackup(entry.ciphertext, this.encryptionKey);
        const restoredChecksum = computeChecksum(plaintext);
        if (restoredChecksum !== entry.manifest.checksum_sha256) {
            throw new BackupChecksumError(backup_id);
        }
        return {
            backup_id,
            restored_at: new Date(),
            tables_restored: entry.manifest.tables,
            checksum_verified: true,
        };
    }
    getManifest(backup_id) {
        return this.storedBackups.get(backup_id)?.manifest || null;
    }
}
