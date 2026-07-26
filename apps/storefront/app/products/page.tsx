import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogProducts, type CatalogProduct } from "../../lib/catalog/queries";
import { SiteHeader } from "../../components/home/site-header";
import { SiteFooter } from "../../components/home/site-footer";
import { CatalogFilterControls } from "../../components/catalog/catalog-filter-controls";
import { ProductGrid } from "../../components/catalog/product-grid";
import { Typography } from "../../components/ui/typography";
import { Container } from "../../components/ui/container";
import { Section } from "../../components/ui/section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Каталог 1-of-1 | WIDE LABEL Fashion Archive",
  description:
    "Полный архив селективных 1-of-1 предметов. Верхняя одежда, свитшоты, деним и редкие винтажные аксессуары в единственном экземпляре.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q || undefined;
  const categoryFilter = params.category || undefined;
  const sortOrder = params.sort || params.order || "created_at";

  let products: CatalogProduct[] = [];
  let error: string | null = null;

  try {
    // Map sort order to Medusa API order or sort locally
    const apiOrder =
      sortOrder === "price_asc"
        ? undefined
        : sortOrder === "price_desc"
        ? undefined
        : sortOrder === "title"
        ? "title"
        : "-created_at";

    products = await getCatalogProducts({
      q: query,
      order: apiOrder,
    });

    // Client-side filtering by category if category parameter is present
    if (categoryFilter) {
      const normalizedCat = categoryFilter.toLowerCase();
      products = products.filter((p) => {
        const catName = String(p.metadata?.category || "").toLowerCase();
        const brandName = String(p.metadata?.brand || "").toLowerCase();
        const title = p.title.toLowerCase();
        return catName.includes(normalizedCat) || brandName.includes(normalizedCat) || title.includes(normalizedCat);
      });
    }

    // Client-side price sorting if price_asc or price_desc requested
    if (sortOrder === "price_asc") {
      products.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sortOrder === "price_desc") {
      products.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[ProductsPage] Error fetching catalog:", detail);
    error = detail || "Не удалось загрузить архивный каталог. Попробуйте обновить страницу.";
  }

  return (
    <div className="storefront-root">
      <SiteHeader />

      <main id="main-content">
        <Section spacing="sm" style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <Container>
            {/* Breadcrumb Navigation */}
            <nav aria-label="Хлебные крошки" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" className="footer-link" style={{ fontSize: "11px" }}>
                ГЛАВНАЯ
              </Link>
              <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                /
              </Typography>
              <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
                КАТАЛОГ 1-OF-1
              </Typography>
            </nav>

            <Typography variant="headline-lg" as="h1" style={{ marginBottom: "8px" }}>
              ФАШН-АРХИВ 1-OF-1
            </Typography>
            <Typography variant="body-md" style={{ maxWidth: "600px", color: "var(--text-secondary)" }}>
              Каждый предмет уникален и представлен в единственном экземпляре. Выберите категорию или используйте поиск по архиву.
            </Typography>
          </Container>
        </Section>

        <Section spacing="md">
          <Container>
            <CatalogFilterControls totalCount={products.length} />

            <ProductGrid products={products} error={error} />
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
