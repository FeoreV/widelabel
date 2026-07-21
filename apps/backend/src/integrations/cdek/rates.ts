import type { CdekAuthClient } from "./auth.js";

export interface CdekLocation {
  code?: number;
  postal_code?: string;
  city?: string;
  address?: string;
}

export interface CdekPackageItem {
  weight: number; // in grams
  length?: number; // in cm
  width?: number; // in cm
  height?: number; // in cm
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

export class CdekRateAdapter {
  private authClient: CdekAuthClient;
  private baseUrl: string;

  constructor(
    authClient: CdekAuthClient,
    baseUrl: string = process.env.CDEK_BASE_URL || "https://api.cdek.ru"
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async calculateRate(
    input: CalculateCdekRateInput
  ): Promise<CdekRateResult> {
    const token = await this.authClient.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/calculator/tariff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`CDEK calculateRate failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      delivery_sum: data.delivery_sum,
      period_min: data.period_min,
      period_max: data.period_max,
      weight_calc: data.weight_calc,
      total_sum: data.total_sum || data.delivery_sum,
      currency: data.currency || "RUB",
    };
  }
}
