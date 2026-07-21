import Link from "next/link";
import { getCartReadModel } from "../../lib/cart/queries";

export default async function CartPage() {
  const cart = await getCartReadModel("demo_cart_id");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/">&larr; Continue Shopping</Link>

      <h1 style={{ marginTop: "1.5rem" }}>Shopping Cart & Active Holds</h1>

      {!cart || cart.items.length === 0 ? (
        <p>Your cart is empty. Explore our 1-of-1 archival drop items.</p>
      ) : (
        <div>
          <div style={{ margin: "1.5rem 0" }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2>{item.title}</h2>
                  <p>Price: ${(item.price / 100).toFixed(2)} {item.currency_code}</p>
                  {item.reserved_until && (
                    <p style={{ color: "#2b6cb0", fontSize: "0.875rem" }}>
                      Hold Expiry: {new Date(item.reserved_until).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "2px solid #333", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
            <h2>Subtotal:</h2>
            <h2>${(cart.total / 100).toFixed(2)} {cart.currency_code}</h2>
          </div>
        </div>
      )}
    </main>
  );
}
