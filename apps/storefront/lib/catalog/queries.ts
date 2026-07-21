import type { AvailabilityResponse } from "@wide-label/types";
import { getMedusaServerClient } from "../medusa/server";

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  variants: {
    id: string;
    title: string;
    price: number;
    currency_code: string;
  }[];
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  return [
    {
      id: "prod_vintage_tee_01",
      title: "Wide Label Vintage Tee",
      description: "1-of-1 vintage heavyweight cotton tee with hand-printed archival logo.",
      thumbnail: null,
      variants: [
        {
          id: "var_vintage_tee_01_l",
          title: "Size L",
          price: 12000,
          currency_code: "USD",
        },
      ],
    },
  ];
}

export async function getCatalogProductById(
  id: string
): Promise<{ product: CatalogProduct; availability: AvailabilityResponse | null }> {
  const products = await getCatalogProducts();
  const product = products.find((p) => p.id === id) || {
    id,
    title: "WIDE LABEL 1-of-1 Piece",
    description: "Exclusive single-piece vintage garment.",
    thumbnail: null,
    variants: [
      {
        id: `var_${id}`,
        title: "Unique Size",
        price: 15000,
        currency_code: "USD",
      },
    ],
  };

  let availability: AvailabilityResponse | null = null;
  if (product.variants[0]) {
    try {
      const client = getMedusaServerClient();
      availability = await client.getAvailability(product.variants[0].id);
    } catch {
      availability = {
        variant_id: product.variants[0].id,
        status: "available",
        reserved_until: null,
      };
    }
  }

  return { product, availability };
}
