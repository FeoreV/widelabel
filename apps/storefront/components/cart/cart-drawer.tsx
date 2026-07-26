"use client";

import React from "react";
import Link from "next/link";
import type { CartReadModel } from "../../lib/cart/queries";
import { formatPrice } from "../catalog/product-card";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";
import { HoldCountdown } from "./hold-countdown";
import { EmptyState } from "../ui/empty";
import { ErrorNotice } from "../ui/error-notice";

export interface CartDrawerProps {
  cart: CartReadModel | null;
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onRemoveItem?: (lineId: string) => void;
}

export function CartDrawer({
  cart,
  isOpen,
  isLoading = false,
  error = null,
  onClose,
  onRemoveItem,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(2px)",
          zIndex: 999,
        }}
      />

      {/* Drawer Panel */}
      <aside
        aria-label="Корзина покупателя и активные брони"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-strong)",
          zIndex: 1000,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Typography variant="title-lg">КОРЗИНА (1-OF-1 HOLD)</Typography>
            <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
              СЕРВЕРНАЯ БРОНЬ 15 МИНУТ
            </Typography>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть корзину"
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontSize: "18px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>
        </div>

        {error && <ErrorNotice message={error} compact={true} />}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {isLoading ? (
            <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
              Загрузка статуса бронирования...
            </Typography>
          ) : !hasItems ? (
            <EmptyState
              title="КОРЗИНА ПУСТА"
              description="В вашей корзине нет забронированных 1-of-1 артефактов."
              action={
                <Button variant="secondary" size="sm" onClick={onClose}>
                  СМОТРЕТЬ КАТАЛОГ
                </Button>
              }
            />
          ) : (
            cart.items.map((item) => {
              const formattedItemPrice = formatPrice(item.price, item.currency_code);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <Typography variant="label" style={{ fontSize: "12px" }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body-sm" style={{ color: "var(--text-primary)", marginTop: "2px" }}>
                        {formattedItemPrice}
                      </Typography>
                    </div>

                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Удалить ${item.title} из корзины`}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--state-error)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        УДАЛИТЬ
                      </button>
                    )}
                  </div>

                  {item.reserved_until && (
                    <div style={{ paddingTop: "8px", borderTop: "1px dashed var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                        БРОНЬ НА СЕРВЕРЕ:
                      </Typography>
                      <HoldCountdown reservedUntil={item.reserved_until} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="label">ИТОГО К ОПЛАТЕ:</Typography>
              <Typography variant="headline-md" style={{ color: "var(--accent-lime)" }}>
                {formatPrice(cart.total, cart.currency_code)}
              </Typography>
            </div>

            <Link href="/cart" onClick={onClose} style={{ width: "100%" }}>
              <Button variant="primary" size="lg" fullWidth={true}>
                ОФОРМИТЬ ЗАКАЗ (CDEK + YOOKASSA)
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
