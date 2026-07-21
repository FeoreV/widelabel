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
export declare function normalizeEmail(email?: string | null): string | null;
export declare function normalizeTelegramHandle(handle?: string | null): string | null;
export declare class InMemoryWaitlistRepository {
    private entries;
    create(input: AddWaitlistInput): WaitlistEntryRecord;
    findActiveByVariant(variantId: string): WaitlistEntryRecord[];
}
