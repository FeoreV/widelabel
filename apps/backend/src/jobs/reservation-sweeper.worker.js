import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.js";
export async function runReservationSweeperBatch(repository, now = new Date()) {
    const expiredRecords = await repository.findExpired(now);
    const expiredReservationIds = [];
    for (const record of expiredRecords) {
        if (record.status === "active" || record.status === "payment_pending") {
            const nextStatus = transitionReservationStatus(record.status, "expired");
            await repository.updateStatus(record.id, nextStatus, {
                released_at: now,
                release_reason: "sweeper_expired",
            });
            expiredReservationIds.push(record.id);
        }
    }
    return {
        sweptCount: expiredReservationIds.length,
        expiredReservationIds,
    };
}
