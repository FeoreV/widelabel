import { z } from "zod";
export declare const EraEnum: z.ZodEnum<{
    archival: "archival";
    "1920s": "1920s";
    "1930s": "1930s";
    "1940s": "1940s";
    "1950s": "1950s";
    "1960s": "1960s";
    "1970s": "1970s";
    "1980s": "1980s";
    "1990s": "1990s";
    "2000s": "2000s";
    unknown: "unknown";
}>;
export type Era = z.infer<typeof EraEnum>;
export declare const ProductMetadataSchema: z.ZodObject<{
    brand: z.ZodOptional<z.ZodString>;
    era: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        archival: "archival";
        "1920s": "1920s";
        "1930s": "1930s";
        "1940s": "1940s";
        "1950s": "1950s";
        "1960s": "1960s";
        "1970s": "1970s";
        "1980s": "1980s";
        "1990s": "1990s";
        "2000s": "2000s";
        unknown: "unknown";
    }>>>;
    condition_rating: z.ZodOptional<z.ZodNumber>;
    condition_label: z.ZodOptional<z.ZodEnum<{
        deadstock: "deadstock";
        excellent: "excellent";
        good: "good";
        worn: "worn";
        restored: "restored";
    }>>;
    archival_notes: z.ZodOptional<z.ZodString>;
    composition: z.ZodOptional<z.ZodString>;
    defects: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodString;
        description: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodEnum<{
            minor: "minor";
            moderate: "moderate";
            severe: "severe";
        }>>;
    }, z.core.$strip>>>;
    measurements_json: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>;
    item_id: z.ZodString;
}, z.core.$strip>;
export type ProductMetadata = z.infer<typeof ProductMetadataSchema>;
export declare const ProductMediaContractSchema: z.ZodArray<z.ZodObject<{
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
}, z.core.$strip>>;
export type ProductMediaContract = z.infer<typeof ProductMediaContractSchema>;
