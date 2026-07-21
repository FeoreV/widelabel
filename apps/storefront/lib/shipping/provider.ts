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
      {
        id: "ship_boxberry_pvz",
        name: "Boxberry Pickup Point (PVZ)",
        type: "pvz",
        provider: "boxberry",
        price: 300,
        currency_code: "RUB",
        estimated_days: "3-5 business days",
      },
    ];
  }
}
