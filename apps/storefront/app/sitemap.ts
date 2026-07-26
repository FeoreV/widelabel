import type { MetadataRoute } from "next";
import { getCatalogProducts } from "../lib/catalog/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://widelabel.me";

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getCatalogProducts();
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.handle || p.id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch {
    // Graceful fallback during static build when backend server is offline
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...productRoutes,
  ];
}
