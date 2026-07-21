import { z } from "zod";
import { ConditionLabelEnum, ConditionRatingSchema, DefectSchema, MeasurementsSchema, MediaSchema, } from "./domain.js";
export const EraEnum = z.enum([
    "1920s",
    "1930s",
    "1940s",
    "1950s",
    "1960s",
    "1970s",
    "1980s",
    "1990s",
    "2000s",
    "archival",
    "unknown",
]);
export const ProductMetadataSchema = z.object({
    brand: z.string().optional(),
    era: EraEnum.optional().default("unknown"),
    condition_rating: ConditionRatingSchema.optional(),
    condition_label: ConditionLabelEnum.optional(),
    archival_notes: z.string().optional(),
    composition: z.string().optional(),
    defects: z.array(DefectSchema).default([]),
    measurements_json: MeasurementsSchema.optional(),
    item_id: z.string(),
});
export const ProductMediaContractSchema = z.array(MediaSchema);
