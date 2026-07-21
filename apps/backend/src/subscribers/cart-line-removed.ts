import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
import { releaseReservationWorkflow } from "../workflows/release-reservation.js";

export interface CartLineRemovedEventData {
  cart_id: string;
  variant_id: string;
  line_item_id?: string;
}

export async function handleCartLineRemoved(
  repository: IReservationRepository,
  event: CartLineRemovedEventData,
  now: Date = new Date()
): Promise<boolean> {
  const released = await releaseReservationWorkflow(
    repository,
    {
      cart_id: event.cart_id,
      variant_id: event.variant_id,
      reason: "cart_line_removed",
    },
    now
  );

  return released !== null;
}
