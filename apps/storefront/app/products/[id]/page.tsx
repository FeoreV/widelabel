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

  const sampleMeasurements = {
    version: 1,
    unit: "cm" as const,
    fields: {
      chest: 58,
      length: 74,
      shoulders: 52,
      sleeve: 22,
    },
  };

  const sampleArchivalNotes = {
    era: "1990s",
    provenance: "Curated archive, Japan release",
    archive_code: "WL-90S-TEE-001",
    story: "Original vintage single-stitched blank with custom hand-screened graphic.",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <Link href="/">&larr; Back to Catalog</Link>

      <div style={{ marginTop: "1.5rem" }}>
        <h1>{product.title}</h1>
        <ProductGallery />

        <p style={{ marginTop: "1.5rem" }}>{product.description}</p>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          ${(product.variants[0]?.price / 100).toFixed(2)}{" "}
          {product.variants[0]?.currency_code}
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
            cartId="demo_cart_id"
            isAvailable={isAvailable}
          />
        </div>

        <ProductDetails
          measurements={sampleMeasurements}
          conditionLabel="excellent"
          conditionRating={5}
          conditionNotes="Excellent vintage condition with light natural wear."
          defects={[]}
          archivalNotes={sampleArchivalNotes}
        />
      </div>
    </main>
  );
}
