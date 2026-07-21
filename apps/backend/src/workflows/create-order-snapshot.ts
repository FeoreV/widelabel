import type { OrderSnapshot, OrderSnapshotRepository } from "../modules/wide-label/models/order-snapshot";
import type { Measurements, Defect } from "@wide-label/types";

export interface CreateOrderSnapshotInput {
  order_id: string;
  variant_id: string;
  consent_version: string;
}

export interface ServerProductCatalogProvider {
  getCanonicalVariantData(variantId: string): Promise<{
    title: string;
    price: number;
    currency_code: string;
    measurements: Measurements;
    defects: Defect[];
    media_checksums: Record<string, string>;
  }>;
}

export async function createOrderSnapshotWorkflow(
  snapshotRepo: OrderSnapshotRepository,
  catalogProvider: ServerProductCatalogProvider,
  input: CreateOrderSnapshotInput
): Promise<OrderSnapshot> {
  // Client price, inventory and metadata are NEVER trusted.
  // Data is fetched exclusively from server-side product catalog provider.
  const canonicalProduct = await catalogProvider.getCanonicalVariantData(
    input.variant_id
  );

  const snapshot: OrderSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order_id: input.order_id,
    variant_id: input.variant_id,
    title: canonicalProduct.title,
    price: canonicalProduct.price,
    currency_code: canonicalProduct.currency_code,
    measurements: canonicalProduct.measurements,
    defects: canonicalProduct.defects,
    media_checksums: canonicalProduct.media_checksums,
    consent_version: input.consent_version,
    created_at: new Date(),
  };

  return snapshotRepo.create(snapshot);
}
