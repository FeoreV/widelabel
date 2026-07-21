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

export class CdekFulfillmentAdapter {
  private authClient: CdekAuthClient;
  private baseUrl: string;
  private createdShipments = new Map<string, CdekShipmentResult>();

  constructor(
    authClient: CdekAuthClient,
    baseUrl: string = process.env.CDEK_BASE_URL || "https://api.cdek.ru"
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async createShipmentOrder(
    input: CreateCdekShipmentInput
  ): Promise<CdekShipmentResult> {
    // Idempotency: Return existing shipment if already registered for order_number
    if (this.createdShipments.has(input.order_number)) {
      return this.createdShipments.get(input.order_number)!;
    }

    const token = await this.authClient.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        number: input.order_number,
        tariff_code: input.tariff_code,
        sender: input.sender,
        recipient: input.recipient,
        from_location: input.from_location,
        to_location: input.to_location,
        packages: input.packages,
        comment: input.comment,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`CDEK createShipmentOrder failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const result: CdekShipmentResult = {
      cdek_order_uuid: data.entity?.uuid || data.uuid || `cdek_uuid_${Date.now()}`,
      order_number: input.order_number,
      status: "ACCEPTED",
      created_at: new Date().toISOString(),
    };

    this.createdShipments.set(input.order_number, result);
    return result;
  }
}
