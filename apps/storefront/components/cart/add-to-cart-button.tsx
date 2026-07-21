"use client";

import { useState } from "react";
import { MedusaStorefrontClient, MedusaClientError } from "../../lib/medusa/client";

export interface AddToCartButtonProps {
  variantId: string;
  cartId: string;
  isAvailable?: boolean;
}

export function AddToCartButton({
  variantId,
  cartId,
  isAvailable = true,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservedUntil, setReservedUntil] = useState<string | null>(null);

  const handleHoldItem = async () => {
    setLoading(true);
    setError(null);

    try {
      const client = new MedusaStorefrontClient();
      const response = await client.holdCartItem({
        variant_id: variantId,
        cart_id: cartId,
      });

      // Status and hold expiry come strictly from backend contract
      setReservedUntil(response.reserved_until);
    } catch (err) {
      if (err instanceof MedusaClientError) {
        setError(err.message);
      } else {
        setError("Unable to reserve item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <button
        disabled
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#cbd5e0",
          color: "#4a5568",
          border: "none",
          borderRadius: "6px",
          cursor: "not-allowed",
          fontWeight: "bold",
        }}
      >
        Item Reserved / Sold Out
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleHoldItem}
        disabled={loading || !!reservedUntil}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: reservedUntil ? "#38a169" : "#2b6cb0",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: loading || reservedUntil ? "default" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading
          ? "Reserving..."
          : reservedUntil
          ? "1-of-1 Piece Reserved in Cart"
          : "Add to Cart (15-min Hold)"}
      </button>

      {reservedUntil && (
        <p style={{ color: "#2f855a", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Item held until {new Date(reservedUntil).toLocaleTimeString()}
        </p>
      )}

      {error && (
        <p style={{ color: "#e53e3e", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
