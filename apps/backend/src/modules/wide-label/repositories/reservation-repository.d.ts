import type { ReservationStatus } from "../models/reservation.js";
export interface ReservationRecord {
    id: string;
    variant_id: string;
    cart_id: string;
    customer_id?: string | null;
    session_fingerprint?: string | null;
    status: ReservationStatus;
    reserved_at: Date;
    expires_at: Date;
    payment_pending_until?: Date | null;
    converted_at?: Date | null;
    released_at?: Date | null;
    release_reason?: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface CreateReservationInput {
    id?: string;
    variant_id: string;
    cart_id: string;
    customer_id?: string | null;
    session_fingerprint?: string | null;
    status?: ReservationStatus;
    reserved_at?: Date;
    expires_at: Date;
}
export interface IReservationRepository {
    findById(id: string): Promise<ReservationRecord | null>;
    findOpenByVariant(variantId: string): Promise<ReservationRecord | null>;
    findOpenByCart(cartId: string): Promise<ReservationRecord[]>;
    findExpired(now?: Date): Promise<ReservationRecord[]>;
    create(input: CreateReservationInput): Promise<ReservationRecord>;
    updateStatus(id: string, status: ReservationStatus, extra?: {
        payment_pending_until?: Date | null;
        converted_at?: Date | null;
        released_at?: Date | null;
        release_reason?: string | null;
    }): Promise<ReservationRecord | null>;
}
export declare class InMemoryReservationRepository implements IReservationRepository {
    private reservations;
    findById(id: string): Promise<ReservationRecord | null>;
    findOpenByVariant(variantId: string): Promise<ReservationRecord | null>;
    findOpenByCart(cartId: string): Promise<ReservationRecord[]>;
    findExpired(now?: Date): Promise<ReservationRecord[]>;
    create(input: CreateReservationInput): Promise<ReservationRecord>;
    updateStatus(id: string, status: ReservationStatus, extra?: {
        payment_pending_until?: Date | null;
        converted_at?: Date | null;
        released_at?: Date | null;
        release_reason?: string | null;
    }): Promise<ReservationRecord | null>;
}
