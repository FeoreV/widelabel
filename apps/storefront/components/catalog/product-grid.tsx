import type { CatalogProduct } from "../../lib/catalog/queries";
import { ProductCard } from "./product-card";

export interface ProductGridProps {
  products: CatalogProduct[];
  isLoading?: boolean;
  error?: string | null;
}

export function ProductGrid({ products, isLoading, error }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="product-grid product-grid-skeleton" aria-label="Загрузка товаров">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="product-card-skeleton" aria-hidden="true">
            <div className="skeleton-image" />
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line price" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid-container product-grid-error">
        <div className="product-grid product-grid-empty-slots">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="product-card empty-product-slot" aria-hidden="true">
              <div className="product-image-container empty-media-state" />
              <div className="product-card-body empty-body-state">
                <span className="empty-slot-line short" />
                <span className="empty-slot-line medium" />
              </div>
            </div>
          ))}
        </div>
        <div className="compact-error-notice" role="alert">
          <span className="notice-text">{error}</span>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-container product-grid-empty">
        <div className="compact-empty-notice">
          <p className="notice-text">Товары пока не добавлены в каталог.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
