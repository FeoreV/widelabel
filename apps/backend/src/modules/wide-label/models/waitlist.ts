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

export class InMemoryWaitlistRepository {
  private entries = new Map<string, WaitlistEntryRecord>();

  public create(input: AddWaitlistInput): WaitlistEntryRecord {
    if (!input.consent_version) {
      throw new Error("Consent version is required to join waitlist");
    }

    const normEmail = normalizeEmail(input.email);
    const normTelegram = normalizeTelegramHandle(input.telegram_handle);

    if (!normEmail && !normTelegram) {
      throw new Error("Either email or telegram_handle must be provided");
    }

    // Deduplication check for active entries
    for (const entry of this.entries.values()) {
      if (entry.variant_id === input.variant_id && entry.status === "active") {
        if (normEmail && entry.email === normEmail) {
          return entry; // Idempotent deduplication: return existing active entry
        }
        if (normTelegram && entry.telegram_handle === normTelegram) {
          return entry; // Idempotent deduplication: return existing active entry
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

  public findActiveByVariant(variantId: string): WaitlistEntryRecord[] {
    return Array.from(this.entries.values()).filter(
      (e) => e.variant_id === variantId && e.status === "active"
    );
  }
}
