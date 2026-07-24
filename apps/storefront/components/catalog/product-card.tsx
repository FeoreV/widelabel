import Link from "next/link";
import type { CatalogProduct } from "../../lib/catalog/queries";

export interface ProductCardProps {
  product: CatalogProduct;
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

export function ProductCard({ product }: ProductCardProps) {
  const primaryVariant = product.variants && product.variants[0];
  const formattedPrice = primaryVariant
    ? formatPrice(primaryVariant.price, primaryVariant.currency_code)
    : null;

  const brandName = product.metadata?.brand ? product.metadata.brand.toUpperCase() : null;
  const imageUrl = product.thumbnail || (product.images && product.images[0]) || null;
  const productHref = `/products/${product.handle || product.id}`;

  const ariaLabel = [
    brandName,
    product.title,
    formattedPrice ? `Цена ${formattedPrice}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="product-card">
      <Link href={productHref} className="product-card-link" aria-label={ariaLabel}>
        <div className="product-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="product-image"
              loading="lazy"
            />
          ) : (
            <div className="product-image-fallback" aria-hidden="true">
              <span className="fallback-brand">WIDE LABEL</span>
              <span className="fallback-tag">ARCHIVE 1-OF-1</span>
            </div>
          )}
        </div>

        <div className="product-card-body">
          {brandName && <span className="product-brand">{brandName}</span>}
          <h3 className="product-title">{product.title}</h3>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          <div className="product-card-footer">
            {formattedPrice && <div className="product-price">{formattedPrice}</div>}
            <button
              type="button"
              className="product-favorite-btn"
              aria-label="Сохранить в избранное"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
