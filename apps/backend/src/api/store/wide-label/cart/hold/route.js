import { CartHoldRequestSchema, } from "@wide-label/types";
import { InMemoryReservationRepository } from "../../../../../modules/wide-label/repositories/reservation-repository.js";
import { reserveVariantWorkflow, ItemHeldError, } from "../../../../../workflows/reserve-variant.js";
export const defaultRepository = new InMemoryReservationRepository();
export const POST = async (req, res) => {
    const parseResult = CartHoldRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errorResp = {
            code: "INVALID_INPUT",
            message: "Invalid request payload",
            retryable: false,
        };
        res.status(400).json(errorResp);
        return;
    }
    const { variant_id, cart_id, session_fingerprint } = parseResult.data;
    const repo = req.scope?.resolve("reservationRepository") || defaultRepository;
    try {
        const now = new Date();
        const reservation = await reserveVariantWorkflow(repo, { variant_id, cart_id, session_fingerprint }, now);
        const responseData = {
            reservation_id: reservation.id,
            variant_id: reservation.variant_id,
            cart_id: reservation.cart_id,
            reserved_until: reservation.expires_at.toISOString(),
            server_time: now.toISOString(),
        };
        res.status(200).json(responseData);
    }
    catch (err) {
        if (err instanceof ItemHeldError) {
            const errorResp = {
                code: err.code,
                message: err.message,
                retryable: err.retryable,
            };
            res.status(409).json(errorResp);
            return;
        }
        const errorResp = {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
            retryable: true,
        };
        res.status(500).json(errorResp);
    }
};
