import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.js";
export async function releaseReservationWorkflow(repository, input, now = new Date()) {
    const openReservation = await repository.findOpenByVariant(input.variant_id);
    if (!openReservation || openReservation.cart_id !== input.cart_id) {
        return null;
    }
    const nextStatus = transitionReservationStatus(openReservation.status, "released");
    return repository.updateStatus(openReservation.id, nextStatus, {
        released_at: now,
        release_reason: input.reason || "cart_line_removed",
    });
}
