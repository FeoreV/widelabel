"use client";

import React, { useState } from "react";
import { MedusaStorefrontClient, MedusaClientError } from "../../lib/medusa/client";
import { Button } from "../ui/button";
import { ErrorNotice } from "../ui/error-notice";
import { HoldCountdown } from "./hold-countdown";
import { WaitlistForm } from "../waitlist/waitlist-form";

export interface AddToCartButtonProps {
  variantId: string;
  cartId?: string;
  isAvailable?: boolean;
}

export function AddToCartButton({
  variantId,
  cartId = "wl_cart_id",
  isAvailable = true,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservedUntil, setReservedUntil] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | undefined>(undefined);
  const [isHeldByOther, setIsHeldByOther] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const handleHoldItem = async () => {
    if (loading || reservedUntil) return;
    setLoading(true);
    setError(null);
    setIsHeldByOther(false);
    setIsExpired(false);

    try {
      const client = new MedusaStorefrontClient();
      const response = await client.holdCartItem({
        variant_id: variantId,
        cart_id: cartId,
      });

      // Reserved until & server time strictly from backend contract
      setReservedUntil(response.reserved_until);
      setServerTime(response.server_time);
    } catch (err) {
      if (err instanceof MedusaClientError) {
        if (err.code === "ITEM_HELD") {
          setIsHeldByOther(true);
          setError("Вещь временно забронирована другим покупателем.");
        } else {
          setError(err.message || "Не удалось забронировать вещь. Попробуйте ещё раз.");
        }
      } else {
        setError("Не удалось забронировать вещь. Попробуйте обновить страницу.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpired = () => {
    setIsExpired(true);
    setReservedUntil(null);
  };

  if (!isAvailable || isHeldByOther) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
        <Button variant="outline" isDisabled={true} fullWidth={true}>
          ВЕЩЬ ВРЕМЕННО ЗАБРОНИРОВАНА / РАСПРОДАНА
        </Button>
        <WaitlistForm variantId={variantId} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {reservedUntil ? (
        <div
          style={{
            padding: "16px",
            backgroundColor: "rgba(204, 255, 0, 0.08)",
            border: "1px solid var(--accent-lime)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-lime)", letterSpacing: "0.1em" }}>
              &check; 1-OF-1 ВЕЩЬ ЗАБРОНИРОВАНА В КОРЗИНЕ
            </span>
            <HoldCountdown
              reservedUntil={reservedUntil}
              serverTime={serverTime}
              onExpired={handleExpired}
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Сервер заблокировал эту вещь на 15 минут. Завершите оформление заказа в корзине.
          </span>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          isLoading={loading}
          isDisabled={loading}
          onClick={handleHoldItem}
        >
          {loading ? "БРОНИРОВАНИЕ НА СЕРВЕРЕ..." : "ЗАБРОНИРОВАТЬ И ДОБАВИТЬ В КОРЗИНУ"}
        </Button>
      )}

      {isExpired && (
        <ErrorNotice
          title="ВРЕМЯ БРОНИ ИСТЕКЛО"
          message="Время 15-минутного удержания вещи истекло. Нажмите кнопку, чтобы забронировать снова."
          compact={true}
        />
      )}

      {error && !isHeldByOther && (
        <ErrorNotice
          message={error}
          onRetry={handleHoldItem}
          compact={true}
        />
      )}
    </div>
  );
}
