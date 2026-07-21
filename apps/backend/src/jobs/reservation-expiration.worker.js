import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.js";
export async function processReservationExpirationJob(repository, jobData, now = new Date()) {
    const openReservation = await repository.findOpenByVariant(jobData.variant_id);
    if (!openReservation || openReservation.id !== jobData.reservation_id) {
        return {
            processed: false,
            reason: "reservation_not_active_or_not_found",
        };
    }
    if (openReservation.expires_at > now) {
        return {
            processed: false,
            reason: "reservation_not_expired_yet",
        };
    }
    const nextStatus = transitionReservationStatus(openReservation.status, "expired");
    await repository.updateStatus(openReservation.id, nextStatus, {
        released_at: now,
        release_reason: "expired",
    });
    return {
        processed: true,
        reservation_id: openReservation.id,
    };
}
