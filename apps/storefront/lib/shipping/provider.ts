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
  getAvailableOptions(): Promise<ShippingOption[]>;
}

export class ApiShippingProvider implements IShippingProvider {
  private backendUrl: string;

  constructor(
    backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"
  ) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
  }

  async getAvailableOptions(): Promise<ShippingOption[]> {
    try {
      const res = await fetch(
        `${this.backendUrl}/store/wide-label/shipping/cdek/rates?to_city_code=44`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.period_min === "number" && typeof data.price === "number") {
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
    } catch {
      // Fallback to static shipping options if backend shipping rate call fails
    }

    return new FakeShippingProvider().getAvailableOptions();
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
