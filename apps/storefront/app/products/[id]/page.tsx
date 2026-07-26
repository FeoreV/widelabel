import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogProductById } from "../../../lib/catalog/queries";
import { SiteHeader } from "../../../components/home/site-header";
import { SiteFooter } from "../../../components/home/site-footer";
import { ProductGallery, type MediaItem } from "../../../components/product/product-gallery";
import { ProductDetails } from "../../../components/product/product-details";
import { AddToCartButton } from "../../../components/cart/add-to-cart-button";
import { formatPrice } from "../../../components/catalog/product-card";
import { Typography } from "../../../components/ui/typography";
import { Container } from "../../../components/ui/container";
import { Section } from "../../../components/ui/section";
import { Badge } from "../../../components/ui/badge";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://widelabel.me";

  try {
    const { product } = await getCatalogProductById(id);
    const brand = product.metadata?.brand ? String(product.metadata.brand) : "WIDE LABEL";
    const title = `${product.title} — ${brand} 1-of-1 Archive`;
    const description = product.description || `Премиальный 1-of-1 предмет ${product.title} в единственном экземпляре.`;
    const images = product.images && product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];
    const productUrl = `${baseUrl}/products/${product.handle || product.id}`;

    return {
      title,
      description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: "WIDE LABEL",
        images: images.map((url) => ({ url, alt: product.title })),
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: "Архивный предмет | WIDE LABEL",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let productData;
  try {
    productData = await getCatalogProductById(id);
  } catch (err) {
    console.error("[ProductPage] Error fetching product:", err);
    notFound();
  }

  const { product, availability } = productData;
  const isAvailable = availability?.status === "available";

  const primaryVariant = product.variants[0];
  const formattedPrice = primaryVariant
    ? formatPrice(primaryVariant.price, primaryVariant.currency_code)
    : null;

  const brandName = product.metadata?.brand ? String(product.metadata.brand).toUpperCase() : null;
  const categoryName = product.metadata?.category ? String(product.metadata.category).toUpperCase() : null;

  // Build media items array from images and thumbnail
  const rawImages = product.images && product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const mediaItems: MediaItem[] = rawImages.map((url, idx) => ({
    id: `media_${idx}`,
    url,
    type: "image",
    alt: `${product.title} - Ракурс ${idx + 1}`,
  }));

  const metadata = product.metadata || {};
  const measurements =
    metadata.measurements && typeof metadata.measurements === "object"
      ? (metadata.measurements as any)
      : null;
  const archivalNotes =
    metadata.archival_notes && typeof metadata.archival_notes === "object"
      ? (metadata.archival_notes as any)
      : metadata.era || metadata.brand
      ? { era: String(metadata.era || ""), provenance: String(metadata.brand || "") }
      : null;

  const conditionLabel = (metadata.condition_label as any) || null;
  const conditionRating = typeof metadata.condition_rating === "number" ? metadata.condition_rating : null;
  const conditionNotes = typeof metadata.condition_notes === "string" ? metadata.condition_notes : null;
  const defects = Array.isArray(metadata.defects) ? metadata.defects : [];
  const material = typeof metadata.material === "string" ? metadata.material : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": rawImages,
    "brand": {
      "@type": "Brand",
      "name": brandName || "WIDE LABEL",
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": primaryVariant?.currency_code || "RUB",
      "price": primaryVariant ? (primaryVariant.price / 100).toFixed(2) : "0.00",
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="storefront-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main id="main-content">
        {/* Breadcrumb Header */}
        <Section spacing="sm" style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <Container>
            <nav aria-label="Хлебные крошки" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link href="/" className="footer-link" style={{ fontSize: "11px" }}>
                ГЛАВНАЯ
              </Link>
              <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                /
              </Typography>
              <Link href="/products" className="footer-link" style={{ fontSize: "11px" }}>
                КАТАЛОГ
              </Link>
              <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                /
              </Typography>
              <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
                {product.title}
              </Typography>
            </nav>
          </Container>
        </Section>

        {/* Main Product Editorial Detail Layout */}
        <Section spacing="lg">
          <Container>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "48px",
                alignItems: "start",
              }}
            >
              {/* Left Column: Image Gallery */}
              <div className="product-gallery-column">
                <ProductGallery
                  media={mediaItems}
                  productTitle={product.title}
                  brandName={brandName || "WIDE LABEL"}
                />
              </div>

              {/* Right Column: Title, Price, Status, CTA & Specs */}
              <div className="product-info-column" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  {(brandName || categoryName) && (
                    <Typography variant="caption" style={{ color: "var(--accent-lime)", marginBottom: "4px", display: "block" }}>
                      {brandName || categoryName} &bull; 1-OF-1 SELECTION
                    </Typography>
                  )}
                  <Typography variant="headline-lg" as="h1" style={{ marginBottom: "12px" }}>
                    {product.title}
                  </Typography>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    {formattedPrice && (
                      <Typography variant="headline-md" style={{ color: "var(--text-primary)" }}>
                        {formattedPrice}
                      </Typography>
                    )}
                    <Badge status={isAvailable ? "available" : "sold"} variant="pill">
                      {isAvailable ? "1-OF-1 AVAILABLE" : "UNAVAILABLE"}
                    </Badge>
                  </div>
                </div>

                {product.description && (
                  <Typography variant="body-md" style={{ color: "var(--text-secondary)" }}>
                    {product.description}
                  </Typography>
                )}

                {/* Reservation Action Button */}
                <div style={{ marginTop: "12px" }}>
                  <AddToCartButton
                    variantId={primaryVariant?.id || `var_${id}`}
                    isAvailable={isAvailable}
                  />
                </div>

                {/* Specs, Measurements & Defects */}
                <ProductDetails
                  measurements={measurements}
                  conditionLabel={conditionLabel}
                  conditionRating={conditionRating}
                  conditionNotes={conditionNotes}
                  defects={defects}
                  archivalNotes={archivalNotes}
                  material={material}
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
