import type { AvailabilityResponse } from "@wide-label/types";
import { getMedusaServerClient } from "../medusa/server";

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  images?: string[];
  handle?: string;
  metadata?: {
    brand?: string;
    era?: string;
    condition_label?: string;
    condition_rating?: number;
    item_id?: string;
    [key: string]: unknown;
  };
  variants: {
    id: string;
    title: string;
    price: number;
    currency_code: string;
  }[];
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const client = getMedusaServerClient();
  const response = await client.listProducts();

  if (!response || !Array.isArray(response.products)) {
    throw new Error("Invalid Medusa products API response format");
  }

  return response.products.map((p) => {
    const variants = (p.variants || []).map((v) => {
      const primaryPriceObj = v.prices && v.prices[0];
      const price = typeof v.price === "number" ? v.price : primaryPriceObj?.amount ?? 0;
      const currency_code = v.currency_code || primaryPriceObj?.currency_code || "";

      return {
        id: v.id,
        title: v.title || "",
        price,
        currency_code,
      };
    });

    const images: string[] = Array.isArray(p.images)
      ? p.images
          .map((img) => (typeof img === "string" ? img : img?.url))
          .filter((url): url is string => Boolean(url))
      : [];

    const meta = p.metadata && typeof p.metadata === "object" ? p.metadata : undefined;
    const metadata = meta
      ? {
          ...meta,
          brand: typeof meta.brand === "string" ? meta.brand : undefined,
          era: typeof meta.era === "string" ? meta.era : undefined,
          condition_label: typeof meta.condition_label === "string" ? meta.condition_label : undefined,
          condition_rating: typeof meta.condition_rating === "number" ? meta.condition_rating : undefined,
          item_id: typeof meta.item_id === "string" ? meta.item_id : undefined,
        }
      : undefined;

    return {
      id: p.id,
      title: p.title || "",
      description: p.description || "",
      thumbnail: p.thumbnail || (images.length > 0 ? images[0] : null),
      images,
      handle: p.handle,
      metadata,
      variants,
    };
  });
}

export async function getCatalogProductById(
  id: string
): Promise<{ product: CatalogProduct; availability: AvailabilityResponse | null }> {
  const products = await getCatalogProducts();
  const product = products.find((p) => p.id === id || p.handle === id);

  if (!product) {
    throw new Error(`Product with id "${id}" not found`);
  }

  let availability: AvailabilityResponse | null = null;
  if (product.variants[0]) {
    const client = getMedusaServerClient();
    availability = await client.getAvailability(product.variants[0].id);
  }

  return { product, availability };
}
