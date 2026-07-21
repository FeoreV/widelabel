/**
 * Backup/restore rehearsal service for PostgreSQL data.
 * Encryption uses AES-256-GCM with a per-backup IV.
 * The key is derived from BACKUP_ENCRYPTION_KEY env variable.
 * Never stores or logs plaintext backup contents.
 */
export interface BackupManifest {
    backup_id: string;
    created_at: Date;
    checksum_sha256: string;
    tables: string[];
    size_bytes: number;
    encrypted: true;
}
export interface RestoreResult {
    backup_id: string;
    restored_at: Date;
    tables_restored: string[];
    checksum_verified: boolean;
}
export declare class BackupEncryptionError extends Error {
    code: string;
    constructor(message: string);
}
export declare class BackupChecksumError extends Error {
    code: string;
    constructor(backupId: string);
}
export declare function encryptBackup(plaintext: Buffer, encryptionKey: string): Buffer;
export declare function decryptBackup(ciphertext: Buffer, encryptionKey: string): Buffer;
export declare function computeChecksum(data: Buffer): string;
export declare class BackupService {
    private encryptionKey;
    private storedBackups;
    constructor(encryptionKey?: string);
    createBackup(tables: string[], data: Buffer): BackupManifest;
    restoreBackup(backup_id: string): RestoreResult;
    getManifest(backup_id: string): BackupManifest | null;
}
