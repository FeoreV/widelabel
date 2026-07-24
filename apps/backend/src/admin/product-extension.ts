import type pg from "pg";
import { getPgPool } from "../infra/db.ts";
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

export interface IAdminProductExtensionService {
  updateProductDetails(input: AdminProductUpdateInput): Promise<AdminProductDetails> | AdminProductDetails;
  getProductDetails(productId: string): Promise<AdminProductDetails | null> | AdminProductDetails | null;
}

export class PostgresAdminProductExtensionService implements IAdminProductExtensionService {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  public async getProductDetails(productId: string): Promise<AdminProductDetails | null> {
    const res = await this.pool.query(
      `SELECT metadata, updated_at FROM product WHERE id = $1`,
      [productId]
    );
    if (res.rows.length === 0) return null;

    const metadata = res.rows[0].metadata || {};
    return {
      product_id: productId,
      condition_label: (metadata.condition_label as ConditionLabel) || "excellent",
      measurements: metadata.measurements_json || { version: 1, unit: "cm", fields: {} },
      defects: metadata.defects || [],
      archival_notes: metadata.archival_notes ?? undefined,
      updated_at: new Date(res.rows[0].updated_at || Date.now()),
    };
  }

  public async updateProductDetails(input: AdminProductUpdateInput): Promise<AdminProductDetails> {
    const existing = await this.getProductDetails(input.product_id);
    const existingMeta = existing ? {
      condition_label: existing.condition_label,
      measurements_json: existing.measurements,
      defects: existing.defects,
      archival_notes: existing.archival_notes,
    } : {};

    const newMeta = {
      ...existingMeta,
      ...(input.condition_label ? { condition_label: input.condition_label } : {}),
      ...(input.measurements ? { measurements_json: input.measurements } : {}),
      ...(input.defects ? { defects: input.defects } : {}),
      ...(input.archival_notes !== undefined ? { archival_notes: input.archival_notes } : {}),
    };

    const now = new Date();
    await this.pool.query(
      `UPDATE product
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
           updated_at = $2
       WHERE id = $3`,
      [JSON.stringify(newMeta), now, input.product_id]
    );

    return {
      product_id: input.product_id,
      condition_label: newMeta.condition_label || "excellent",
      measurements: newMeta.measurements_json || { version: 1, unit: "cm", fields: {} },
      defects: newMeta.defects || [],
      archival_notes: newMeta.archival_notes,
      updated_at: now,
    };
  }
}

export class InMemoryAdminProductExtensionService implements IAdminProductExtensionService {
  private products = new Map<string, AdminProductDetails>();

  public updateProductDetails(input: AdminProductUpdateInput): AdminProductDetails {
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
    return updated;
  }

  public getProductDetails(productId: string): AdminProductDetails | null {
    return this.products.get(productId) || null;
  }
}

export const AdminProductExtensionService = PostgresAdminProductExtensionService;
