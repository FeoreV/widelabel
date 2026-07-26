import { MedusaStorefrontClient } from "./client";

export interface MedusaProductApiItem {
  id: string;
  title: string;
  description?: string | null;
  handle?: string;
  thumbnail?: string | null;
  images?: Array<{ id?: string; url: string }> | string[];
  metadata?: Record<string, unknown> | null;
  variants?: Array<{
    id: string;
    title: string;
    price?: number;
    currency_code?: string;
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
}

export interface MedusaProductsResponse {
  products: MedusaProductApiItem[];
  count?: number;
  offset?: number;
  limit?: number;
}

export interface ListProductsOptions {
  q?: string;
  collection_id?: string[];
  category_id?: string[];
  order?: string;
  limit?: number;
  offset?: number;
}

export class ExtendedMedusaServerClient extends MedusaStorefrontClient {
  async listProducts(options?: ListProductsOptions): Promise<MedusaProductsResponse> {
    const backendUrl =
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:9000";
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.MEDUSA_PUBLISHABLE_KEY ||
      "pk_0f5bfcffb9885273914dc748f5afa0a5f8ffd41557ea1b9631422069f1c81989";

    const params = new URLSearchParams();
    params.set("fields", "*variants,*variants.prices,*images,*metadata");

    if (options?.q) {
      params.set("q", options.q);
    }
    if (options?.order) {
      params.set("order", options.order);
    }
    if (options?.limit) {
      params.set("limit", String(options.limit));
    }
    if (options?.offset) {
      params.set("offset", String(options.offset));
    }

    const url = `${backendUrl.replace(/\/$/, "")}/store/products?${params.toString()}`;

    let response: Response;
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey;
      }

      response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[Medusa Server Client] Connection error:", detail);
      throw new Error(
        `Сервер каталога Medusa недоступен. Попробуйте обновить страницу. (${detail})`
      );
    }

    if (!response.ok) {
      const statusText = response.statusText ? ` ${response.statusText}` : "";
      const errorMsg = `Medusa API error: ${response.status}${statusText}`;
      console.error("[Medusa Server Client] API error:", errorMsg);
      throw new Error(errorMsg);
    }

    return response.json();
  }

  async getCart(cartId: string): Promise<any> {
    const backendUrl =
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:9000";
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.MEDUSA_PUBLISHABLE_KEY ||
      "pk_0f5bfcffb9885273914dc748f5afa0a5f8ffd41557ea1b9631422069f1c81989";
    const url = `${backendUrl.replace(/\/$/, "")}/store/carts/${encodeURIComponent(cartId)}?fields=*items,*items.variant`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey;
    }

    const response = await fetch(url, { method: "GET", headers, cache: "no-store" });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Medusa getCart failed: ${response.status}`);
    }
    const data = await response.json();
    return data.cart || data;
  }

  async createCart(currencyCode = "rub"): Promise<any> {
    const backendUrl =
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:9000";
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.MEDUSA_PUBLISHABLE_KEY ||
      "pk_0f5bfcffb9885273914dc748f5afa0a5f8ffd41557ea1b9631422069f1c81989";
    const url = `${backendUrl.replace(/\/$/, "")}/store/carts`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ currency_code: currencyCode }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Medusa createCart failed: ${response.status}`);
    }

    const data = await response.json();
    return data.cart || data;
  }
}

export function getMedusaServerClient(): ExtendedMedusaServerClient {
  return new ExtendedMedusaServerClient();
}
