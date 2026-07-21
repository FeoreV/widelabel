import type { CartReadModel } from "../../lib/cart/queries.js";

export interface CartDrawerProps {
  cart: CartReadModel | null;
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
}

export function CartDrawer({
  cart,
  isOpen,
  isLoading = false,
  error = null,
  onClose,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Shopping Cart Drawer"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "360px",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
        zIndex: 1000,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Your Cart (1-of-1 Hold)</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
          &times;
        </button>
      </div>

      {isLoading && <p>Loading cart status...</p>}

      {error && (
        <div style={{ backgroundColor: "#fff5f5", color: "#c53030", padding: "0.75rem", borderRadius: "4px", margin: "1rem 0" }}>
          {error}
        </div>
      )}

      {!isLoading && !cart && <p style={{ margin: "2rem 0" }}>Your cart is empty.</p>}

      {!isLoading && cart && (
        <div style={{ flex: 1, overflowY: "auto", marginTop: "1rem" }}>
          {cart.items.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3>{item.title}</h3>
              <p>Price: ${(item.price / 100).toFixed(2)} {item.currency_code}</p>
              {item.reserved_until && (
                <p style={{ color: "#2b6cb0", fontSize: "0.875rem" }}>
                  Reserved until: {new Date(item.reserved_until).toLocaleTimeString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && cart && (
        <div style={{ borderTop: "1px solid #ddd", paddingTop: "1rem", marginTop: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total:</span>
            <span>${(cart.total / 100).toFixed(2)} {cart.currency_code}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
