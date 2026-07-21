import type { MedusaContainer } from "@medusajs/framework/types";
import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { transitionReservationStatus } from "../modules/wide-label/domain/reservation-state-machine.ts";

export interface ReservationExpirationJobData {
  reservation_id: string;
  variant_id: string;
}

export interface ExpirationProcessResult {
  processed: boolean;
  reservation_id?: string;
  reason?: string;
}

export async function processReservationExpirationJob(
  repository: IReservationRepository,
  jobData: ReservationExpirationJobData,
  now: Date = new Date()
): Promise<ExpirationProcessResult> {
  const openReservation = await repository.findById(jobData.reservation_id);

  if (
    !openReservation ||
    openReservation.variant_id !== jobData.variant_id ||
    (openReservation.status !== "active" && openReservation.status !== "payment_pending")
  ) {
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

  const nextStatus = transitionReservationStatus(
    openReservation.status,
    "expired"
  );

  await repository.updateStatus(openReservation.id, nextStatus, {
    released_at: now,
    release_reason: "expired",
  });

  return {
    processed: true,
    reservation_id: openReservation.id,
  };
}

export default async function reservationExpirationJob(container: MedusaContainer) {
  const repository = container.hasRegistration?.("reservationRepository")
    ? (container.resolve("reservationRepository") as IReservationRepository)
    : null;
  if (repository) {
    // Scheduled processing if needed
  }
}

export const config = {
  name: "reservation-expiration",
  schedule: "* * * * *",
};

