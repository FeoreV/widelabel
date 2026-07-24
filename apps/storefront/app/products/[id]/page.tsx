import Link from "next/link";
import { getCatalogProductById } from "../../../lib/catalog/queries";
import { ProductGallery } from "../../../components/product/product-gallery";
import { ProductDetails } from "../../../components/product/product-details";
import { AddToCartButton } from "../../../components/cart/add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { product, availability } = await getCatalogProductById(id);

  const isAvailable = availability?.status === "available";

  const metadata = product.metadata || {};
  const measurements =
    metadata.measurements && typeof metadata.measurements === "object"
      ? (metadata.measurements as any)
      : null;
  const archivalNotes =
    metadata.archival_notes && typeof metadata.archival_notes === "object"
      ? (metadata.archival_notes as any)
      : metadata.era || metadata.brand
      ? { era: metadata.era, provenance: metadata.brand }
      : null;
  const conditionLabel = metadata.condition_label || null;
  const conditionRating = typeof metadata.condition_rating === "number" ? metadata.condition_rating : null;
  const conditionNotes = typeof metadata.condition_notes === "string" ? metadata.condition_notes : null;
  const defects = Array.isArray(metadata.defects) ? metadata.defects : [];

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <Link href="/">&larr; Back to Catalog</Link>

      <div style={{ marginTop: "1.5rem" }}>
        <h1>{product.title}</h1>
        <ProductGallery />

        <p style={{ marginTop: "1.5rem" }}>{product.description}</p>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {(product.variants[0]?.price / 100).toFixed(2)}{" "}
          {product.variants[0]?.currency_code || "RUB"}
        </p>

        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            backgroundColor: isAvailable ? "#e6fffa" : "#fff5f5",
            color: isAvailable ? "#234e52" : "#9b2c2c",
            display: "inline-block",
            marginBottom: "1.5rem",
          }}
        >
          Status: <strong>{availability?.status || "Checking..."}</strong>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <AddToCartButton
            variantId={product.variants[0]?.id || `var_${id}`}
            cartId="wl_cart_id"
            isAvailable={isAvailable}
          />
        </div>

        <ProductDetails
          measurements={measurements}
          conditionLabel={conditionLabel as any}
          conditionRating={conditionRating}
          conditionNotes={conditionNotes}
          defects={defects}
          archivalNotes={archivalNotes}
        />
      </div>
    </main>
  );
}
