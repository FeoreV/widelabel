import type { CdekAuthClient } from "./auth.js";
export interface CdekLocation {
    code?: number;
    postal_code?: string;
    city?: string;
    address?: string;
}
export interface CdekPackageItem {
    weight: number;
    length?: number;
    width?: number;
    height?: number;
}
export interface CalculateCdekRateInput {
    tariff_code: number;
    from_location: CdekLocation;
    to_location: CdekLocation;
    packages: CdekPackageItem[];
}
export interface CdekRateResult {
    delivery_sum: number;
    period_min: number;
    period_max: number;
    weight_calc: number;
    total_sum: number;
    currency: string;
}
export declare class CdekRateAdapter {
    private authClient;
    private baseUrl;
    constructor(authClient: CdekAuthClient, baseUrl?: string);
    calculateRate(input: CalculateCdekRateInput): Promise<CdekRateResult>;
}
