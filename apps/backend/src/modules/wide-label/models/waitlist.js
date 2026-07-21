export function normalizeEmail(email) {
    if (!email)
        return null;
    const trimmed = email.trim().toLowerCase();
    return trimmed || null;
}
export function normalizeTelegramHandle(handle) {
    if (!handle)
        return null;
    const trimmed = handle.trim().replace(/^@/, "").toLowerCase();
    return trimmed || null;
}
export class InMemoryWaitlistRepository {
    entries = new Map();
    create(input) {
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
        const record = {
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
    findActiveByVariant(variantId) {
        return Array.from(this.entries.values()).filter((e) => e.variant_id === variantId && e.status === "active");
    }
}
