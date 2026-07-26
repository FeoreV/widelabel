import type { CatalogProduct } from "../../lib/catalog/queries";
import { ProductCard } from "./product-card";
import { Skeleton } from "../ui/loading";
import { EmptyState } from "../ui/empty";
import { ErrorNotice } from "../ui/error-notice";

export interface ProductGridProps {
  products: CatalogProduct[];
  isLoading?: boolean;
  error?: string | null;
}

export function ProductGrid({ products, isLoading, error }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="product-grid product-grid-skeleton" aria-label="Загрузка архивных товаров">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="product-card-skeleton" aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Skeleton aspectRatio="1 / 1.12" />
            <Skeleton height="10px" width="40%" />
            <Skeleton height="12px" width="80%" />
            <Skeleton height="14px" width="30%" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid-container product-grid-error" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ErrorNotice
          title="СБОЙ ЗАГРУЗКИ АРХИВА"
          message={error}
          compact={true}
        />
        <div className="product-grid product-grid-empty-slots">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="product-card empty-product-slot" aria-hidden="true">
              <div className="product-image-container empty-media-state" style={{ aspectRatio: "1 / 1.12", backgroundColor: "var(--bg-surface-elevated)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-sm)" }} />
              <div className="product-card-body empty-body-state" style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="empty-slot-line short" style={{ height: "8px", width: "40%", backgroundColor: "rgba(255,255,255,0.06)" }} />
                <span className="empty-slot-line medium" style={{ height: "8px", width: "70%", backgroundColor: "rgba(255,255,255,0.06)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-container product-grid-empty">
        <EmptyState
          title="НОВЫЕ ПОСТУПЛЕНИЯ ОЖИДАЮТСЯ"
          description="Текущий дроп полностью раскуплен. Подпишитесь на уведомления о следующем релизе 1-of-1."
          compact={true}
        />
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
