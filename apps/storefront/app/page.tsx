import Link from "next/link";
import { getCatalogProducts, type CatalogProduct } from "../lib/catalog/queries";
import { SiteHeader } from "../components/home/site-header";
import { HeroSection } from "../components/home/hero";
import { FeatureStrip } from "../components/home/feature-strip";
import { ConceptBlock } from "../components/home/concept-block";
import { CollectionsGrid } from "../components/home/collections-grid";
import { ProductGrid } from "../components/catalog/product-grid";
import { EditorialStorySection } from "../components/home/editorial-story-section";
import { SiteFooter } from "../components/home/site-footer";
import { Typography } from "../components/ui/typography";
import { Section } from "../components/ui/section";
import { Container } from "../components/ui/container";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let products: CatalogProduct[] = [];
  let error: string | null = null;

  try {
    products = await getCatalogProducts();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[HomePage] Error fetching catalog products:", detail);
    error = detail || "Каталог временно недоступен. Попробуйте обновить страницу.";
  }

  return (
    <div className="storefront-root">
      <SiteHeader />

      <main id="main-content">
        <HeroSection />
        <FeatureStrip />
        <ConceptBlock />

        {/* Content area: Collections & New Arrivals in split grid layout on desktop */}
        <Section id="catalog" spacing="lg">
          <Container>
            <div className="homepage-main-grid">
              {/* Left Column: Collections */}
              <div className="grid-column collections-column">
                <CollectionsGrid />
              </div>

              {/* Right Column: New Arrivals / Current Drop */}
              <div className="grid-column new-arrivals-column">
                <section
                  id="new-arrivals"
                  className="new-arrivals-section"
                  aria-labelledby="new-arrivals-heading"
                >
                  <div className="section-header">
                    <Typography id="new-arrivals-heading" variant="headline-md" as="h2">
                      ТЕКУЩИЙ ДРОП
                    </Typography>
                    <Link
                      href="/#catalog"
                      className="section-link"
                      aria-label="Смотреть все новые поступления"
                    >
                      СМОТРЕТЬ ВСЕ &rarr;
                    </Link>
                  </div>

                  <ProductGrid products={products} error={error} />
                </section>
              </div>
            </div>
          </Container>
        </Section>

        <EditorialStorySection />
      </main>

      <SiteFooter />
    </div>
  );
}
