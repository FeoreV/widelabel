import type pg from "pg";
import { getPgPool } from "../../../infra/db.ts";
import type { WaitlistChannel, WaitlistStatus } from "@wide-label/types";

export interface WaitlistEntryRecord {
  id: string;
  variant_id: string;
  email?: string | null;
  telegram_handle?: string | null;
  channel: WaitlistChannel;
  consent_version: string;
  status: WaitlistStatus;
  created_at: Date;
  updated_at: Date;
}

export interface AddWaitlistInput {
  variant_id: string;
  email?: string | null;
  telegram_handle?: string | null;
  channel: WaitlistChannel;
  consent_version: string;
}

export function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

export function normalizeTelegramHandle(handle?: string | null): string | null {
  if (!handle) return null;
  const trimmed = handle.trim().replace(/^@/, "").toLowerCase();
  return trimmed || null;
}

export interface IWaitlistRepository {
  create(input: AddWaitlistInput): Promise<WaitlistEntryRecord>;
  findActiveByVariant(variantId: string): Promise<WaitlistEntryRecord[]>;
}

export class PostgresWaitlistRepository implements IWaitlistRepository {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  private mapRow(row: any): WaitlistEntryRecord {
    return {
      id: row.id,
      variant_id: row.variant_id,
      email: row.email ?? null,
      telegram_handle: row.telegram_chat_id ?? null,
      channel: row.channel as WaitlistChannel,
      consent_version: row.consent_version,
      status: row.status as WaitlistStatus,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  public async create(input: AddWaitlistInput): Promise<WaitlistEntryRecord> {
    if (!input.consent_version) {
      throw new Error("Consent version is required to join waitlist");
    }

    const normEmail = normalizeEmail(input.email);
    const normTelegram = normalizeTelegramHandle(input.telegram_handle);

    if (!normEmail && !normTelegram) {
      throw new Error("Either email or telegram_handle must be provided");
    }

    const normalizedContact = normEmail || normTelegram || "";
    const now = new Date();

    // Check existing active entry
    const existingRes = await this.pool.query(
      `SELECT * FROM wide_label_waitlist_entry
       WHERE variant_id = $1 AND normalized_contact = $2 AND status = 'active'
       LIMIT 1`,
      [input.variant_id, normalizedContact]
    );

    if (existingRes.rows.length > 0) {
      return this.mapRow(existingRes.rows[0]);
    }

    const res = await this.pool.query(
      `INSERT INTO wide_label_waitlist_entry (
         variant_id, email, telegram_chat_id, channel, normalized_contact, status, consent_version, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, 'active', $6, $7, $8
       ) RETURNING *`,
      [input.variant_id, normEmail, normTelegram, input.channel, normalizedContact, input.consent_version, now, now]
    );

    return this.mapRow(res.rows[0]);
  }

  public async findActiveByVariant(variantId: string): Promise<WaitlistEntryRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_waitlist_entry WHERE variant_id = $1 AND status = 'active'`,
      [variantId]
    );
    return res.rows.map((r) => this.mapRow(r));
  }
}

export class InMemoryWaitlistRepository implements IWaitlistRepository {
  private entries = new Map<string, WaitlistEntryRecord>();

  public async create(input: AddWaitlistInput): Promise<WaitlistEntryRecord> {
    if (!input.consent_version) {
      throw new Error("Consent version is required to join waitlist");
    }

    const normEmail = normalizeEmail(input.email);
    const normTelegram = normalizeTelegramHandle(input.telegram_handle);

    if (!normEmail && !normTelegram) {
      throw new Error("Either email or telegram_handle must be provided");
    }

    for (const entry of this.entries.values()) {
      if (entry.variant_id === input.variant_id && entry.status === "active") {
        if (normEmail && entry.email === normEmail) {
          return entry;
        }
        if (normTelegram && entry.telegram_handle === normTelegram) {
          return entry;
        }
      }
    }

    const id = `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: WaitlistEntryRecord = {
      id,
      variant_id: input.variant_id,
      email: normEmail,
      telegram_handle: normTelegram,
      channel: input.channel,
      consent_version: input.consent_version,
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.entries.set(id, record);
    return record;
  }

  public async findActiveByVariant(variantId: string): Promise<WaitlistEntryRecord[]> {
    return Array.from(this.entries.values()).filter(
      (e) => e.variant_id === variantId && e.status === "active"
    );
  }
}
