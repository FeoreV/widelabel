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

export class AdminProductExtensionService {
  private products = new Map<string, AdminProductDetails>();

  public updateProductDetails(
    input: AdminProductUpdateInput
  ): AdminProductDetails {
    const existing = this.products.get(input.product_id) || {
      product_id: input.product_id,
      condition_label: "excellent" as ConditionLabel,
      measurements: { version: 1, unit: "cm", fields: {} },
      defects: [],
      updated_at: new Date(),
    };

    const updated: AdminProductDetails = {
      ...existing,
      condition_label: input.condition_label || existing.condition_label,
      measurements: input.measurements || existing.measurements,
      defects: input.defects || existing.defects,
      archival_notes:
        input.archival_notes !== undefined
          ? input.archival_notes
          : existing.archival_notes,
      updated_at: new Date(),
    };

    this.products.set(input.product_id, updated);

    // CRITICAL INVARIANT GUARANTEE: This admin update ONLY mutates live product metadata.
    // OrderSnapshot tables are strictly untouched.
    return updated;
  }

  public getProductDetails(productId: string): AdminProductDetails | null {
    return this.products.get(productId) || null;
  }
}
