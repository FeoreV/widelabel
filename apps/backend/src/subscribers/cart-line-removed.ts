import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { releaseReservationWorkflow } from "../workflows/release-reservation.ts";

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

export default async function cartLineRemovedSubscriber({
  event,
  container,
}: SubscriberArgs<CartLineRemovedEventData>) {
  const repository = container.hasRegistration?.("reservationRepository")
    ? (container.resolve("reservationRepository") as IReservationRepository)
    : null;

  if (repository && event?.data) {
    await handleCartLineRemoved(repository, event.data as CartLineRemovedEventData);
  }
}

export const config: SubscriberConfig = {
  event: "cart.line-item-removed",
};

export const subscriberConfig = config;

