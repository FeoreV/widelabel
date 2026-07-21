import type { CdekAuthClient } from "./auth.js";
export type SystemFulfillmentStatus = "created" | "in_transit" | "ready_for_pickup" | "delivered" | "failed" | "canceled";
export interface CdekOrderStatusInfo {
    cdek_order_uuid: string;
    cdek_status_code: string;
    cdek_status_name?: string;
    fulfillment_status: SystemFulfillmentStatus;
    status_date: string;
}
export declare class CdekStatusAdapter {
    private authClient;
    private baseUrl;
    constructor(authClient: CdekAuthClient, baseUrl?: string);
    getShipmentStatus(cdekOrderUuid: string): Promise<CdekOrderStatusInfo>;
    mapCdekStatusToFulfillmentStatus(cdekStatusCode: string): SystemFulfillmentStatus;
}
