import type { Measurements, Defect } from "@wide-label/types";
export interface OrderSnapshot {
    id: string;
    order_id: string;
    variant_id: string;
    title: string;
    price: number;
    currency_code: string;
    measurements: Measurements;
    defects: Defect[];
    media_checksums: Record<string, string>;
    consent_version: string;
    created_at: Date;
}
export declare class OrderSnapshotImmutableError extends Error {
    code: string;
    constructor(message?: string);
}
export declare class OrderSnapshotRepository {
    private snapshots;
    create(snapshot: OrderSnapshot): OrderSnapshot;
    findById(id: string): OrderSnapshot | null;
    findByOrderId(orderId: string): OrderSnapshot[];
    update(): never;
}
