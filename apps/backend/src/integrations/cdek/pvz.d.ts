import type { CdekAuthClient } from "./auth.js";
export interface CdekPvzPoint {
    code: string;
    name: string;
    location: {
        city_code: number;
        city: string;
        address: string;
        postal_code?: string;
        longitude?: number;
        latitude?: number;
    };
    work_time?: string;
    phones?: Array<{
        number: string;
    }>;
    is_handout?: boolean;
}
export interface CdekPvzDestinationSnapshot {
    pvz_code: string;
    name: string;
    city_code: number;
    city: string;
    address: string;
    postal_code?: string;
    work_time?: string;
    phone?: string;
    snapshot_at: string;
}
export declare class CdekPvzAdapter {
    private authClient;
    private baseUrl;
    constructor(authClient: CdekAuthClient, baseUrl?: string);
    getPvzsByCity(cityCode: number): Promise<CdekPvzPoint[]>;
    validatePvzCode(pvzCode: string): Promise<CdekPvzPoint | null>;
    createPvzDestinationSnapshot(pvzCode: string): Promise<CdekPvzDestinationSnapshot>;
}
