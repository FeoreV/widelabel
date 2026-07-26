import Link from "next/link";
import type { CatalogProduct } from "../../lib/catalog/queries";
import { ImageWrapper } from "../ui/image-wrapper";
import { Typography } from "../ui/typography";
import { Badge, StatusBadge, type BadgeStatus } from "../ui/badge";

export interface ProductCardProps {
  product: CatalogProduct;
  availabilityStatus?: "available" | "reserved" | "sold" | "unavailable";
}

export function formatPrice(priceInMinorUnits: number, currencyCode: string): string {
  const code = (currencyCode || "RUB").toUpperCase();
  const amount = priceInMinorUnits / 100;

  if (code === "RUB") {
    return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
  }

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

export function ProductCard({ product, availabilityStatus }: ProductCardProps) {
  const primaryVariant = product.variants && product.variants[0];
  const formattedPrice = primaryVariant
    ? formatPrice(primaryVariant.price, primaryVariant.currency_code)
    : null;

  const brandName = product.metadata?.brand ? String(product.metadata.brand).toUpperCase() : null;
  const categoryName = product.metadata?.category ? String(product.metadata.category).toUpperCase() : null;
  const imageUrl = product.thumbnail || (product.images && product.images[0]) || null;
  const productHref = `/products/${product.handle || product.id}`;

  const status: BadgeStatus =
    availabilityStatus ||
    (product.metadata?.status as BadgeStatus) ||
    "available";

  const ariaLabel = [
    status !== "available" ? status.toUpperCase() : null,
    brandName || categoryName,
    product.title,
    formattedPrice ? `Цена ${formattedPrice}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={`product-card ${status !== "available" ? `product-card-${status}` : ""}`}>
      <Link href={productHref} className="product-card-link" aria-label={ariaLabel}>
        <div style={{ position: "relative", width: "100%" }}>
          <ImageWrapper
            src={imageUrl}
            alt={product.title}
            aspectRatio="1 / 1.12"
            hoverScale={true}
            fallbackBrand={brandName || categoryName || "WIDE LABEL"}
            fallbackTag="1-OF-1 ARCHIVE"
          />

          {/* Status Badge overlay (always visible on mobile & desktop, not hidden on hover) */}
          <div style={{ position: "absolute", top: "8px", left: "8px", zIndex: 2 }}>
            {status === "reserved" ? (
              <Badge status="reserved" variant="pill">
                RESERVED (HOLD)
              </Badge>
            ) : status === "sold" ? (
              <Badge status="sold" variant="pill">
                SOLD OUT
              </Badge>
            ) : status === "unavailable" ? (
              <Badge status="error" variant="pill">
                UNAVAILABLE
              </Badge>
            ) : (
              <Badge status="available" variant="pill">
                1-OF-1
              </Badge>
            )}
          </div>
        </div>

        <div className="product-card-body" style={{ marginTop: "10px" }}>
          {(brandName || categoryName) && (
            <Typography variant="caption" style={{ color: "var(--text-secondary)", marginBottom: "2px" }}>
              {brandName || categoryName}
            </Typography>
          )}
          <Typography
            variant="title-lg"
            style={{
              fontSize: "13px",
              lineHeight: "1.25",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "32px",
            }}
          >
            {product.title}
          </Typography>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          <div className="product-card-footer" style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {formattedPrice ? (
              <Typography
                variant="label"
                style={{
                  fontSize: "13px",
                  color: status === "sold" ? "var(--text-tertiary)" : "var(--text-primary)",
                  textDecoration: status === "sold" ? "line-through" : "none",
                }}
              >
                {formattedPrice}
              </Typography>
            ) : (
              <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                N/A
              </Typography>
            )}
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
              SINGLE ITEM
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
