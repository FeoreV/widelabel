import type {
  IReservationRepository,
  ReservationRecord,
} from "../modules/wide-label/repositories/reservation-repository.ts";
import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.ts";

export interface ReleaseReservationInput {
  cart_id: string;
  variant_id: string;
  reason?: string;
}

export async function releaseReservationWorkflow(
  repository: IReservationRepository,
  input: ReleaseReservationInput,
  now: Date = new Date()
): Promise<ReservationRecord | null> {
  const openReservation = await repository.findOpenByVariant(input.variant_id, now);

  if (!openReservation || openReservation.cart_id !== input.cart_id) {
    return null;
  }

  const nextStatus = transitionReservationStatus(
    openReservation.status,
    "released"
  );

  return repository.updateStatus(openReservation.id, nextStatus, {
    released_at: now,
    release_reason: input.reason || "cart_line_removed",
  });
}
