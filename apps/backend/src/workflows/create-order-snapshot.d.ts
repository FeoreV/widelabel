import type { OrderSnapshot, OrderSnapshotRepository } from "../modules/wide-label/models/order-snapshot.js";
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
export declare function createOrderSnapshotWorkflow(snapshotRepo: OrderSnapshotRepository, catalogProvider: ServerProductCatalogProvider, input: CreateOrderSnapshotInput): Promise<OrderSnapshot>;
