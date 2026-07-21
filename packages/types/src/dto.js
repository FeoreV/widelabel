import { z } from "zod";
// Product Availability Response Schema
export const AvailabilityStatusEnum = z.enum([
    "available",
    "reserved",
    "sold",
    "hold",
]);
export const AvailabilityResponseSchema = z.object({
    variant_id: z.string(),
    status: AvailabilityStatusEnum,
    reserved_until: z.string().datetime().nullable(),
});
// Cart Hold Request & Response Schema
export const CartHoldRequestSchema = z.object({
    variant_id: z.string(),
    cart_id: z.string(),
    session_fingerprint: z.string().optional(),
});
export const CartHoldResponseSchema = z.object({
    reservation_id: z.string(),
    variant_id: z.string(),
    cart_id: z.string(),
    reserved_until: z.string().datetime(),
    server_time: z.string().datetime(),
});
// Standard Error Response Schema
export const ErrorResponseSchema = z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean().default(false),
});
