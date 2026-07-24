import Link from "next/link";

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
      href: "#outerwear",
    },
    {
      id: "sweatshirts",
      title: "СВИТШОТЫ И ХУДИ",
      href: "#sweatshirts",
    },
    {
      id: "jeans",
      title: "ДЖИНСЫ",
      href: "#jeans",
    },
    {
      id: "accessories",
      title: "АКСЕССУАРЫ",
      href: "#accessories",
    },
  ];

  return (
    <section className="collections-section" aria-labelledby="collections-heading">
      <div className="section-header">
        <h2 id="collections-heading" className="section-title">
          КОЛЛЕКЦИИ
        </h2>
        <Link href="#collections" className="section-link" aria-label="Смотреть все коллекции">
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
                <h3 className="collection-title">{item.title}</h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
