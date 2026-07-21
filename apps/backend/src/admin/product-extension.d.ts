import type { ConditionLabel } from "@wide-label/types";
export interface AdminProductUpdateInput {
    product_id: string;
    condition_label?: ConditionLabel;
    measurements?: {
        version: number;
        unit: "cm" | "inch";
        fields: Record<string, number | null | undefined>;
    };
    defects?: Array<{
        kind: string;
        description: string;
        severity?: "minor" | "moderate" | "severe";
    }>;
    archival_notes?: string;
}
export interface AdminProductDetails {
    product_id: string;
    condition_label: ConditionLabel;
    measurements: {
        version: number;
        unit: "cm" | "inch";
        fields: Record<string, number | null | undefined>;
    };
    defects: Array<{
        kind: string;
        description: string;
        severity?: "minor" | "moderate" | "severe";
    }>;
    archival_notes?: string;
    updated_at: Date;
}
export declare class AdminProductExtensionService {
    private products;
    updateProductDetails(input: AdminProductUpdateInput): AdminProductDetails;
    getProductDetails(productId: string): AdminProductDetails | null;
}
