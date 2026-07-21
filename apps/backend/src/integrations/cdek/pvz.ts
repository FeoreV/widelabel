import type { CdekAuthClient } from "./auth";

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
  phones?: Array<{ number: string }>;
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

export class CdekPvzAdapter {
  private authClient: CdekAuthClient;
  private baseUrl: string;

  constructor(
    authClient: CdekAuthClient,
    baseUrl: string = process.env.CDEK_BASE_URL || "https://api.cdek.ru"
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async getPvzsByCity(cityCode: number): Promise<CdekPvzPoint[]> {
    const token = await this.authClient.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/deliverypoints?city_code=${cityCode}&type=PVZ`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`CDEK getPvzsByCity failed (${response.status}): ${errText}`);
    }

    return response.json();
  }

  public async validatePvzCode(pvzCode: string): Promise<CdekPvzPoint | null> {
    const token = await this.authClient.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/deliverypoints?code=${pvzCode}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const points: CdekPvzPoint[] = await response.json();
    return points.find((p) => p.code === pvzCode) || null;
  }

  public async createPvzDestinationSnapshot(
    pvzCode: string
  ): Promise<CdekPvzDestinationSnapshot> {
    const pvz = await this.validatePvzCode(pvzCode);
    if (!pvz) {
      throw new Error(`Invalid or inactive CDEK PVZ code: ${pvzCode}`);
    }

    return {
      pvz_code: pvz.code,
      name: pvz.name,
      city_code: pvz.location.city_code,
      city: pvz.location.city,
      address: pvz.location.address,
      postal_code: pvz.location.postal_code,
      work_time: pvz.work_time,
      phone: pvz.phones?.[0]?.number,
      snapshot_at: new Date().toISOString(),
    };
  }
}
