import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CartHoldRequestSchema,
  type CartHoldResponse,
  type ErrorResponse,
} from "@wide-label/types";
import {
  PostgresReservationRepository,
  reserveVariantWorkflow,
  ItemHeldError,
} from "../../../../../modules/wide-label/index.ts";

export const defaultRepository = new PostgresReservationRepository();

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const parseResult = CartHoldRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorResp: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "Invalid request payload",
      retryable: false,
    };
    res.status(400).json(errorResp);
    return;
  }

  const { variant_id, cart_id, session_fingerprint } = parseResult.data;
  const repo: PostgresReservationRepository =
    (req as any).scope?.resolve("reservationRepository") || defaultRepository;

  try {
    const now = new Date();
    const reservation = await reserveVariantWorkflow(
      repo,
      { variant_id, cart_id, session_fingerprint },
      now
    );

    const responseData: CartHoldResponse = {
      reservation_id: reservation.id,
      variant_id: reservation.variant_id,
      cart_id: reservation.cart_id,
      reserved_until: reservation.expires_at.toISOString(),
      server_time: now.toISOString(),
    };

    res.status(200).json(responseData);
  } catch (err) {
    if (err instanceof ItemHeldError) {
      const errorResp: ErrorResponse = {
        code: err.code,
        message: err.message,
        retryable: err.retryable,
      };
      res.status(409).json(errorResp);
      return;
    }

    const errorResp: ErrorResponse = {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      retryable: true,
    };
    res.status(500).json(errorResp);
  }
};
