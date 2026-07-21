import type { ReservationStatus } from "../models/reservation.js";
export declare const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReadonlySet<ReservationStatus>>;
export declare function canTransitionReservation(fromStatus: ReservationStatus, toStatus: ReservationStatus): boolean;
export declare class InvalidStateTransitionError extends Error {
    constructor(fromStatus: ReservationStatus, toStatus: ReservationStatus);
}
export declare function transitionReservationStatus(currentStatus: ReservationStatus, nextStatus: ReservationStatus): ReservationStatus;
