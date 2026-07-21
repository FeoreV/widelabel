import Link from "next/link";
import { getCatalogProducts } from "../lib/catalog/queries";

export default async function HomePage() {
  const products = await getCatalogProducts();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>WIDE LABEL — Archives & 1-of-1 Pieces</h1>
      <p>Exclusive single-piece curated garments. No restocks.</p>

      <section style={{ display: "grid", gap: "1.5rem", marginTop: "2rem" }}>
        {products.map((product) => (
          <article
            key={product.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>
              Price: ${(product.variants[0]?.price / 100).toFixed(2)}{" "}
              {product.variants[0]?.currency_code}
            </p>
            <Link href={`/products/${product.id}`}>View 1-of-1 Piece &rarr;</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
