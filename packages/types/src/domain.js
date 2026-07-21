import { z } from "zod";
// Condition Label Enum & Schema
export const ConditionLabelEnum = z.enum([
    "deadstock",
    "excellent",
    "good",
    "worn",
    "restored",
]);
export const ConditionRatingSchema = z.number().int().min(1).max(5);
// Defect Schema
export const DefectSchema = z.object({
    kind: z.string(),
    description: z.string(),
    location: z.string().optional(),
    severity: z.enum(["minor", "moderate", "severe"]).optional(),
});
// Measurements Schema
export const MeasurementsSchema = z.object({
    version: z.number().int().default(1),
    unit: z.enum(["cm", "inch"]).default("cm"),
    fields: z.object({
        chest: z.number().nullable().optional(),
        shoulders: z.number().nullable().optional(),
        length: z.number().nullable().optional(),
        sleeve: z.number().nullable().optional(),
        waist: z.number().nullable().optional(),
        inseam: z.number().nullable().optional(),
    }),
    notes: z.string().optional(),
});
// Media Schema
export const MediaKindEnum = z.enum([
    "cover",
    "detail",
    "label",
    "defect",
    "archival",
]);
export const MediaSchema = z.object({
    kind: MediaKindEnum,
    sort_order: z.number().int().default(0),
    alt: z.string().optional(),
    sha256: z.string(),
    width: z.number().int(),
    height: z.number().int(),
    url: z.string().url(),
    key: z.string(),
});
// Reservation Status Enum
export const ReservationStatusEnum = z.enum([
    "active",
    "payment_pending",
    "released",
    "expired",
    "converted",
    "cancelled",
]);
// Waitlist Channel & Status
export const WaitlistChannelEnum = z.enum(["email", "telegram", "both"]);
export const WaitlistStatusEnum = z.enum([
    "active",
    "unsubscribed",
    "notified",
    "invalid",
]);
