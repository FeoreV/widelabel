import { z } from "zod";
export declare const ConditionLabelEnum: z.ZodEnum<{
    deadstock: "deadstock";
    excellent: "excellent";
    good: "good";
    worn: "worn";
    restored: "restored";
}>;
export type ConditionLabel = z.infer<typeof ConditionLabelEnum>;
export declare const ConditionRatingSchema: z.ZodNumber;
export declare const DefectSchema: z.ZodObject<{
    kind: z.ZodString;
    description: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<{
        minor: "minor";
        moderate: "moderate";
        severe: "severe";
    }>>;
}, z.core.$strip>;
export type Defect = z.infer<typeof DefectSchema>;
export declare const MeasurementsSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodNumber>;
    unit: z.ZodDefault<z.ZodEnum<{
        cm: "cm";
        inch: "inch";
    }>>;
    fields: z.ZodObject<{
        chest: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        shoulders: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sleeve: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        waist: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        inseam: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Measurements = z.infer<typeof MeasurementsSchema>;
export declare const MediaKindEnum: z.ZodEnum<{
    cover: "cover";
    detail: "detail";
    label: "label";
    defect: "defect";
    archival: "archival";
}>;
export type MediaKind = z.infer<typeof MediaKindEnum>;
export declare const MediaSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        cover: "cover";
        detail: "detail";
        label: "label";
        defect: "defect";
        archival: "archival";
    }>;
    sort_order: z.ZodDefault<z.ZodNumber>;
    alt: z.ZodOptional<z.ZodString>;
    sha256: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    url: z.ZodString;
    key: z.ZodString;
}, z.core.$strip>;
export type Media = z.infer<typeof MediaSchema>;
export declare const ReservationStatusEnum: z.ZodEnum<{
    active: "active";
    payment_pending: "payment_pending";
    released: "released";
    expired: "expired";
    converted: "converted";
    cancelled: "cancelled";
}>;
export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;
export declare const WaitlistChannelEnum: z.ZodEnum<{
    email: "email";
    telegram: "telegram";
    both: "both";
}>;
export type WaitlistChannel = z.infer<typeof WaitlistChannelEnum>;
export declare const WaitlistStatusEnum: z.ZodEnum<{
    active: "active";
    unsubscribed: "unsubscribed";
    notified: "notified";
    invalid: "invalid";
}>;
export type WaitlistStatus = z.infer<typeof WaitlistStatusEnum>;
