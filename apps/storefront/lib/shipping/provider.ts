export interface ShippingOption {
  id: string;
  name: string;
  type: "address" | "pvz";
  provider?: "cdek" | "boxberry" | "yandex";
  price: number;
  currency_code: string;
  estimated_days: string;
}

export interface IShippingProvider {
  getAvailableOptions(toCityCode?: number | string): Promise<ShippingOption[]>;
}

export class ApiShippingProvider implements IShippingProvider {
  private backendUrl: string;

  constructor(
    backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"
  ) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
  }

  async getAvailableOptions(toCityCode: number | string = 44): Promise<ShippingOption[]> {
    const res = await fetch(
      `${this.backendUrl}/store/wide-label/shipping/cdek/rates?to_city_code=${encodeURIComponent(toCityCode)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`Shipping rate calculation failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data || typeof data.price !== "number" || typeof data.period_min !== "number") {
      throw new Error("Invalid shipping rate response format from provider");
    }

    return [
      {
        id: "ship_cdek_pvz",
        name: "CDEK Pickup Point (PVZ)",
        type: "pvz",
        provider: "cdek",
        price: data.price,
        currency_code: data.currency || "RUB",
        estimated_days: `${data.period_min}-${data.period_max || data.period_min + 2} days`,
      },
    ];
  }
}

export class FakeShippingProvider implements IShippingProvider {
  async getAvailableOptions(): Promise<ShippingOption[]> {
    return [
      {
        id: "ship_courier_std",
        name: "Standard Door-to-Door Courier",
        type: "address",
        price: 500,
        currency_code: "RUB",
        estimated_days: "2-4 business days",
      },
      {
        id: "ship_cdek_pvz",
        name: "CDEK Pickup Point (PVZ)",
        type: "pvz",
        provider: "cdek",
        price: 350,
        currency_code: "RUB",
        estimated_days: "2-3 business days",
      },
    ];
  }
}
