import type { IReservationRepository, ReservationRecord } from "../modules/wide-label/repositories/reservation-repository.js";
export declare const HOLD_DURATION_MS: number;
export declare class ItemHeldError extends Error {
    readonly code = "ITEM_HELD";
    readonly retryable = false;
    constructor(message?: string);
}
export interface ReserveVariantInput {
    variant_id: string;
    cart_id: string;
    customer_id?: string | null;
    session_fingerprint?: string | null;
}
export declare function reserveVariantWorkflow(repository: IReservationRepository, input: ReserveVariantInput, now?: Date): Promise<ReservationRecord>;
