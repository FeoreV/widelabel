import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.js";

export interface SweeperRunResult {
  sweptCount: number;
  expiredReservationIds: string[];
}

export async function runReservationSweeperBatch(
  repository: IReservationRepository,
  now: Date = new Date()
): Promise<SweeperRunResult> {
  const expiredRecords = await repository.findExpired(now);
  const expiredReservationIds: string[] = [];

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
