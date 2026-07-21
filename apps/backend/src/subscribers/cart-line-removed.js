import { releaseReservationWorkflow } from "../workflows/release-reservation.js";
export async function handleCartLineRemoved(repository, event, now = new Date()) {
    const released = await releaseReservationWorkflow(repository, {
        cart_id: event.cart_id,
        variant_id: event.variant_id,
        reason: "cart_line_removed",
    }, now);
    return released !== null;
}
