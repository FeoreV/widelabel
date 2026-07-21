import { z } from "zod";
export declare const AvailabilityStatusEnum: z.ZodEnum<{
    available: "available";
    reserved: "reserved";
    sold: "sold";
    hold: "hold";
}>;
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;
export declare const AvailabilityResponseSchema: z.ZodObject<{
    variant_id: z.ZodString;
    status: z.ZodEnum<{
        available: "available";
        reserved: "reserved";
        sold: "sold";
        hold: "hold";
    }>;
    reserved_until: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type AvailabilityResponse = z.infer<typeof AvailabilityResponseSchema>;
export declare const CartHoldRequestSchema: z.ZodObject<{
    variant_id: z.ZodString;
    cart_id: z.ZodString;
    session_fingerprint: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CartHoldRequest = z.infer<typeof CartHoldRequestSchema>;
export declare const CartHoldResponseSchema: z.ZodObject<{
    reservation_id: z.ZodString;
    variant_id: z.ZodString;
    cart_id: z.ZodString;
    reserved_until: z.ZodString;
    server_time: z.ZodString;
}, z.core.$strip>;
export type CartHoldResponse = z.infer<typeof CartHoldResponseSchema>;
export declare const ErrorResponseSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
