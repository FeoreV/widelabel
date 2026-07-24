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

export class ExtendedMedusaServerClient extends MedusaStorefrontClient {
  async listProducts(): Promise<MedusaProductsResponse> {
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
    const url = `${backendUrl.replace(/\/$/, "")}/store/products?fields=*variants,*variants.prices,*images,*metadata`;

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
}

export function getMedusaServerClient(): ExtendedMedusaServerClient {
  return new ExtendedMedusaServerClient();
}
