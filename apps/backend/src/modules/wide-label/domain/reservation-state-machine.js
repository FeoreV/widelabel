export const ALLOWED_TRANSITIONS = {
    active: new Set(["payment_pending", "released", "expired", "cancelled"]),
    payment_pending: new Set([
        "converted",
        "released",
        "expired",
        "cancelled",
    ]),
    released: new Set(),
    expired: new Set(),
    converted: new Set(),
    cancelled: new Set(),
};
export function canTransitionReservation(fromStatus, toStatus) {
    return ALLOWED_TRANSITIONS[fromStatus]?.has(toStatus) ?? false;
}
export class InvalidStateTransitionError extends Error {
    constructor(fromStatus, toStatus) {
        super(`Cannot transition reservation state from '${fromStatus}' to '${toStatus}'.`);
        this.name = "InvalidStateTransitionError";
    }
}
export function transitionReservationStatus(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
        return currentStatus;
    }
    if (!canTransitionReservation(currentStatus, nextStatus)) {
        throw new InvalidStateTransitionError(currentStatus, nextStatus);
    }
    return nextStatus;
}
