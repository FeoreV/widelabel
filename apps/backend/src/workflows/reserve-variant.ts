import type {
  IReservationRepository,
  ReservationRecord,
} from "../modules/wide-label/repositories/reservation-repository";

export const HOLD_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class ItemHeldError extends Error {
  readonly code = "ITEM_HELD";
  readonly retryable = false;

  constructor(message = "Item is temporarily reserved by another customer.") {
    super(message);
    this.name = "ItemHeldError";
  }
}

export interface ReserveVariantInput {
  variant_id: string;
  cart_id: string;
  customer_id?: string | null;
  session_fingerprint?: string | null;
}

export async function reserveVariantWorkflow(
  repository: IReservationRepository,
  input: ReserveVariantInput,
  now: Date = new Date()
): Promise<ReservationRecord> {
  const existingOpen = await repository.findOpenByVariant(input.variant_id, now);

  if (existingOpen) {
    if (existingOpen.cart_id === input.cart_id) {
      // Idempotent same-cart retry: return existing reservation without extending expiry
      return existingOpen;
    }
    throw new ItemHeldError();
  }

  const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

  try {
    return await repository.create(
      {
        variant_id: input.variant_id,
        cart_id: input.cart_id,
        customer_id: input.customer_id,
        session_fingerprint: input.session_fingerprint,
        status: "active",
        reserved_at: now,
        expires_at: expiresAt,
      },
      now
    );
  } catch (err: any) {
    if (err.message && err.message.includes("Open reservation already exists")) {
      throw new ItemHeldError();
    }
    throw err;
  }
}
