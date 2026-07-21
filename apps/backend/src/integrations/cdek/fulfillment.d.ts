import type { CdekAuthClient } from "./auth.js";
import type { CdekLocation, CdekPackageItem } from "./rates.js";
export interface CdekContactPerson {
    name: string;
    phone: string;
    email?: string;
}
export interface CreateCdekShipmentInput {
    order_number: string;
    tariff_code: number;
    sender: CdekContactPerson;
    recipient: CdekContactPerson;
    from_location: CdekLocation;
    to_location: CdekLocation;
    packages: CdekPackageItem[];
    comment?: string;
}
export interface CdekShipmentResult {
    cdek_order_uuid: string;
    order_number: string;
    status: "CREATED" | "ACCEPTED";
    created_at: string;
}
export declare class CdekFulfillmentAdapter {
    private authClient;
    private baseUrl;
    private createdShipments;
    constructor(authClient: CdekAuthClient, baseUrl?: string);
    createShipmentOrder(input: CreateCdekShipmentInput): Promise<CdekShipmentResult>;
}
