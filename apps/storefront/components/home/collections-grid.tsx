import Link from "next/link";
import { Typography } from "../ui/typography";

export interface CollectionItem {
  id: string;
  title: string;
  href: string;
  countLabel?: string;
  imageUrl?: string;
}

export function CollectionsGrid() {
  const collections: CollectionItem[] = [
    {
      id: "outerwear",
      title: "ВЕРХНЯЯ ОДЕЖДА",
      href: "/#catalog",
      countLabel: "1-OF-1 SELECTION",
    },
    {
      id: "sweatshirts",
      title: "СВИТШОТЫ И ХУДИ",
      href: "/#catalog",
      countLabel: "ARCHIVE PIECES",
    },
    {
      id: "jeans",
      title: "ДЖИНСЫ & ДЕНИМ",
      href: "/#catalog",
      countLabel: "VINTAGE DENIM",
    },
    {
      id: "accessories",
      title: "АКСЕССУАРЫ",
      href: "/#catalog",
      countLabel: "CURATED CAPS & BAGS",
    },
  ];

  return (
    <section id="collections" className="collections-section" aria-labelledby="collections-heading">
      <div className="section-header">
        <Typography id="collections-heading" variant="headline-md" as="h2">
          КОЛЛЕКЦИИ
        </Typography>
        <Link href="/#catalog" className="section-link" aria-label="Смотреть все коллекции">
          СМОТРЕТЬ ВСЕ &rarr;
        </Link>
      </div>

      <div className="collections-grid">
        {collections.map((item) => (
          <article key={item.id} className="collection-card">
            <Link href={item.href} className="collection-card-link" aria-label={item.title}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="collection-card-image"
                  loading="lazy"
                />
              )}
              <div className="collection-card-overlay" aria-hidden="true" />
              <div className="collection-card-body">
                <Typography variant="title-lg" className="collection-title">
                  {item.title}
                </Typography>
                {item.countLabel && (
                  <Typography variant="caption" className="collection-count" style={{ color: "var(--accent-lime)" }}>
                    {item.countLabel}
                  </Typography>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
