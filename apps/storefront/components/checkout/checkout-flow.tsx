"use client";

import React, { useState } from "react";
import type { CartReadModel } from "../../lib/cart/queries";
import { MedusaStorefrontClient, MedusaClientError } from "../../lib/medusa/client";
import { ShippingStep, type ShippingDetails } from "./shipping-step";
import { HoldCountdown } from "../cart/hold-countdown";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";
import { ErrorNotice } from "../ui/error-notice";
import { formatPrice } from "../catalog/product-card";

export interface CheckoutFlowProps {
  cart: CartReadModel;
  cartId: string;
}

export function CheckoutFlow({ cart: initialCart, cartId }: CheckoutFlowProps) {
  const [cart, setCart] = useState<CartReadModel>(initialCart);
  const [step, setStep] = useState<"review" | "shipping" | "payment" | "success">("review");

  // Customer & Shipping State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);

  // Consent State
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Item Removal
  const handleRemoveItem = async (lineId: string) => {
    setLoading(true);
    setError(null);
    try {
      const client = new MedusaStorefrontClient();
      const res = await client.removeLineItem(cartId, lineId);
      if (res && res.cart) {
        setCart({
          id: res.cart.id,
          subtotal: res.cart.subtotal || res.cart.total || 0,
          total: res.cart.total || 0,
          currency_code: res.cart.currency_code || "RUB",
          items: res.cart.items || [],
        });
      } else {
        setCart((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== lineId),
        }));
      }
    } catch (err) {
      setError("Не удалось удалить вещь из корзины.");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingValidated = async (details: ShippingDetails) => {
    setShippingDetails(details);
    setLoading(true);
    setError(null);
    try {
      const client = new MedusaStorefrontClient();
      await client.submitShipping({
        cart_id: cartId,
        shipping_option_id: details.selectedOption.id,
        address: {
          city: details.city,
          street: details.street,
          pvz_code: details.pvzCode,
        },
      });
      setStep("payment");
    } catch (err) {
      const msg = err instanceof MedusaClientError ? err.message : "Не удалось сохранить параметры доставки.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!consentAgreed) {
      setError("Необходимо принять условия обработки персональных данных и правила покупки 1-of-1 артефактов.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = new MedusaStorefrontClient();
      const res = await client.submitPayment({
        cart_id: cartId,
        provider_id: "yookassa",
        consent_version: "v1.0",
      });

      if (res.redirect_url) {
        // Redirect to YooKassa secure payment gateway
        window.location.href = res.redirect_url;
        return;
      }

      if (res.status === "succeeded") {
        setStep("success");
      } else if (res.status === "pending") {
        setError("Платеж находится в обработке ЮKassa. Ожидание ответа...");
      } else {
        setError("Не удалось провести платёж. Попробуйте ещё раз.");
      }
    } catch (err) {
      if (err instanceof MedusaClientError) {
        if (err.code === "ITEM_HELD") {
          setError("Время вашей брони истекло или вещь забронирована другим покупателем.");
        } else {
          setError(err.message || "Ошибка оплаты ЮKassa.");
        }
      } else {
        setError("Произошла ошибка при соединении с платежным шлюзом.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Typography variant="headline-md" style={{ marginBottom: "12px" }}>
          КОРЗИНА ПУСТА
        </Typography>
        <Typography variant="body-md" style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Все брони истекли или предметы были удалены. Выберите уникальные артефакты в каталоге.
        </Typography>
        <a href="/products">
          <Button variant="primary" size="lg">
            ПЕРЕЙТИ В КАТАЛОГ
          </Button>
        </a>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div
        style={{
          padding: "32px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--accent-lime)",
          borderRadius: "var(--radius-sm)",
          textAlign: "center",
        }}
      >
        <Typography variant="caption" style={{ color: "var(--accent-lime)", marginBottom: "8px", display: "block" }}>
          &check; ОПЛАТА И БРОНЬ ПОДТВЕРЖДЕНЫ
        </Typography>
        <Typography variant="headline-lg" style={{ marginBottom: "16px" }}>
          ЗАКАЗ УСПЕШНО ОФОРМЛЕН
        </Typography>
        <Typography variant="body-md" style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 24px" }}>
          Ваша 1-of-1 вещь зарезервирована и передана на упаковочный стол WIDE LABEL. Данные по доставке СДЭК и трек-номер отправлены на {email || "указанный email"}.
        </Typography>
        <a href="/">
          <Button variant="outline" size="md">
            ВЕРНУТЬСЯ В МАГАЗИН
          </Button>
        </a>
      </div>
    );
  }

  const shippingCost = shippingDetails?.selectedOption.price || 0;
  const grandTotal = cart.total + shippingCost;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
      {/* Left Column: Flow Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor: step === "review" ? "var(--accent-lime)" : "var(--bg-surface)",
              color: step === "review" ? "#0a0b0c" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            1. СОСТАВ ЗАКАЗА
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>&rarr;</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor: step === "shipping" ? "var(--accent-lime)" : "var(--bg-surface)",
              color: step === "shipping" ? "#0a0b0c" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            2. ДОСТАВКА СДЭК
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>&rarr;</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor: step === "payment" ? "var(--accent-lime)" : "var(--bg-surface)",
              color: step === "payment" ? "#0a0b0c" : "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            3. ОПЛАТА ЮKASSA
          </span>
        </div>

        {error && <ErrorNotice message={error} compact={true} />}

        {/* Step 1: Review Items & Customer Details */}
        {step === "review" && (
          <div
            style={{
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <Typography variant="title-lg">КОНТАКТНЫЕ ДАННЫЕ</Typography>
            <div>
              <label htmlFor="email-field" style={{ display: "block", marginBottom: "6px" }}>
                <Typography variant="label" style={{ fontSize: "11px" }}>
                  EMAIL ДЛЯ ЧЕКА И СДЭК КВИТАНЦИИ
                </Typography>
              </label>
              <input
                id="email-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@widelabel.com"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label htmlFor="phone-field" style={{ display: "block", marginBottom: "6px" }}>
                <Typography variant="label" style={{ fontSize: "11px" }}>
                  ТЕЛЕФОН (ДЛЯ SMS УВЕДОМЛЕНИЙ СДЭК)
                </Typography>
              </label>
              <input
                id="phone-field"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              isDisabled={!email}
              onClick={() => {
                if (!email) {
                  setError("Укажите ваш email для отправки чека и статуса заказа.");
                  return;
                }
                setStep("shipping");
              }}
            >
              ПЕРЕЙТИ К ВЫБОРУ ДОСТАВКИ
            </Button>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === "shipping" && (
          <ShippingStep onShippingValidated={handleShippingValidated} />
        )}

        {/* Step 3: Payment & Consent */}
        {step === "payment" && (
          <div
            style={{
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <Typography variant="title-lg">ОПЛАТА ЧЕРЕЗ ЮKASSA</Typography>
              <Typography variant="caption" style={{ color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                Безопасный платёж с поддержкой СБП, банковских карт и SberPay
              </Typography>
            </div>

            {/* Mandatory Consent Checkbox */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                style={{ marginTop: "3px", accentColor: "var(--accent-lime)" }}
              />
              <Typography variant="body-sm" style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                Я согласен с правилами обработки персональных данных и условиями покупки 1-of-1 артефактов селективного секонд-хенда (версия v1.0).
              </Typography>
            </label>

            <Button
              variant="primary"
              size="lg"
              fullWidth={true}
              isLoading={loading}
              isDisabled={loading || !consentAgreed}
              onClick={handlePaymentSubmit}
            >
              {loading ? "ПЕРЕХОД К ОПЛАТЕ..." : `ОПЛАТИТЬ ${formatPrice(grandTotal, cart.currency_code)}`}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setStep("shipping")}>
              &larr; Назад к выбору доставки
            </Button>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary Sidebar */}
      <div
        style={{
          padding: "24px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Typography variant="title-lg">ЗАКАЗ 1-OF-1</Typography>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.items.map((item) => (
            <div key={item.id} style={{ paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="label" style={{ fontSize: "12px" }}>
                  {item.title}
                </Typography>
                {step === "review" && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ background: "none", border: "none", color: "var(--state-error)", fontSize: "11px" }}
                  >
                    Удалить
                  </button>
                )}
              </div>
              <Typography variant="body-sm" style={{ color: "var(--text-primary)", marginTop: "4px" }}>
                {formatPrice(item.price, item.currency_code)}
              </Typography>
              {item.reserved_until && (
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                    БРОНЬ:
                  </Typography>
                  <HoldCountdown reservedUntil={item.reserved_until} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
              Стоимость вещей:
            </Typography>
            <Typography variant="body-sm">{formatPrice(cart.total, cart.currency_code)}</Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
              Доставка СДЭК:
            </Typography>
            <Typography variant="body-sm">
              {shippingDetails ? formatPrice(shippingCost, cart.currency_code) : "Расчёт далее"}
            </Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
            <Typography variant="title-lg">ИТОГО:</Typography>
            <Typography variant="headline-md" style={{ color: "var(--accent-lime)" }}>
              {formatPrice(grandTotal, cart.currency_code)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
