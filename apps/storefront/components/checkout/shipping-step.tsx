"use client";

import React, { useEffect, useState } from "react";
import { ApiShippingProvider, type IShippingProvider, type ShippingOption } from "../../lib/shipping/provider";
import { MedusaStorefrontClient, type CdekPvzItem } from "../../lib/medusa/client";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";
import { ErrorNotice } from "../ui/error-notice";
import { formatPrice } from "../catalog/product-card";

export interface ShippingDetails {
  city: string;
  toCityCode: number | string;
  street?: string;
  pvzCode?: string;
  pvzAddress?: string;
  selectedOption: ShippingOption;
}

export interface ShippingStepProps {
  provider?: IShippingProvider;
  onShippingValidated?: (details: ShippingDetails) => void;
  defaultCityCode?: number | string;
}

export function ShippingStep({
  provider = new ApiShippingProvider(),
  onShippingValidated,
  defaultCityCode = 44, // 44 = Москва
}: ShippingStepProps) {
  const [cityCode, setCityCode] = useState<number | string>(defaultCityCode);
  const [cityName, setCityName] = useState<string>("Москва");
  const [streetAddress, setStreetAddress] = useState<string>("");

  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);

  const [pvzList, setPvzList] = useState<CdekPvzItem[]>([]);
  const [selectedPvzCode, setSelectedPvzCode] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchShippingRates = async (code: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const opts = await provider.getAvailableOptions(code);
      setOptions(opts);
      if (opts.length > 0) {
        setSelectedOption(opts[0]);
      } else {
        setSelectedOption(null);
      }

      // Fetch CDEK PVZs for the selected city
      const client = new MedusaStorefrontClient();
      const pvzs = await client.getCdekPvzs(code).catch(() => []);
      setPvzList(pvzs);
      if (pvzs.length > 0) {
        setSelectedPvzCode(pvzs[0].code);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Не удалось рассчитать стоимость доставки СДЭК.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingRates(cityCode);
  }, [cityCode]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selectedText = e.target.options[e.target.selectedIndex].text;
    setCityCode(val);
    setCityName(selectedText);
  };

  const handleConfirmShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedOption) {
      setValidationError("Пожалуйста, выберите вариант доставки.");
      return;
    }

    if (selectedOption.type === "pvz" && pvzList.length > 0 && !selectedPvzCode) {
      setValidationError("Пожалуйста, выберите пункт выдачи СДЭК (ПВЗ).");
      return;
    }

    const selectedPvz = pvzList.find((p) => p.code === selectedPvzCode);

    onShippingValidated?.({
      city: cityName,
      toCityCode: cityCode,
      street: streetAddress,
      pvzCode: selectedPvzCode || undefined,
      pvzAddress: selectedPvz ? `${selectedPvz.name} (${selectedPvz.address})` : undefined,
      selectedOption,
    });
  };

  return (
    <form
      onSubmit={handleConfirmShipping}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "24px",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <div>
        <Typography variant="title-lg">ДОСТАВКА СДЭК (ЭКСПРЕСС)</Typography>
        <Typography variant="caption" style={{ color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
          Укажите город получения и выберите удобный ПВЗ или курьерскую доставку
        </Typography>
      </div>

      {/* City Selector */}
      <div>
        <label htmlFor="city-select" style={{ display: "block", marginBottom: "6px" }}>
          <Typography variant="label" style={{ fontSize: "11px" }}>
            ГОРОД ДОСТАВКИ
          </Typography>
        </label>
        <select
          id="city-select"
          value={cityCode}
          onChange={handleCityChange}
          style={{
            width: "100%",
            height: "40px",
            padding: "0 12px",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="44">Москва</option>
          <option value="137">Санкт-Петербург</option>
          <option value="270">Казань</option>
          <option value="258">Екатеринбург</option>
          <option value="252">Новосибирск</option>
          <option value="362">Нижний Новгород</option>
        </select>
      </div>

      {loading ? (
        <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
          Расчёт тарифов СДЭК...
        </Typography>
      ) : error ? (
        <ErrorNotice message={error} onRetry={() => fetchShippingRates(cityCode)} compact={true} />
      ) : options.length === 0 ? (
        <Typography variant="body-sm" style={{ color: "var(--state-error)" }}>
          Нет доступных вариантов доставки для выбранного региона.
        </Typography>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typography variant="label" style={{ fontSize: "11px" }}>
            ВАРИАНТЫ ДОСТАВКИ
          </Typography>

          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            return (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? "1px solid var(--accent-lime)" : "1px solid var(--border-subtle)",
                  backgroundColor: isSelected ? "rgba(204, 255, 0, 0.05)" : "var(--bg-primary)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="shipping_option"
                    checked={isSelected}
                    onChange={() => setSelectedOption(opt)}
                    style={{ accentColor: "var(--accent-lime)" }}
                  />
                  <div>
                    <Typography variant="label" style={{ fontSize: "12px", display: "block" }}>
                      {opt.name}
                    </Typography>
                    <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                      Срок: {opt.estimated_days}
                    </Typography>
                  </div>
                </div>

                <Typography variant="title-lg" style={{ color: "var(--accent-lime)" }}>
                  {formatPrice(opt.price, opt.currency_code)}
                </Typography>
              </label>
            );
          })}

          {/* PVZ Picker if PVZ type option selected */}
          {selectedOption?.type === "pvz" && pvzList.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <label htmlFor="pvz-select" style={{ display: "block", marginBottom: "6px" }}>
                <Typography variant="label" style={{ fontSize: "11px" }}>
                  ПУНКТ ВЫДАЧИ СДЭК (ПВЗ)
                </Typography>
              </label>
              <select
                id="pvz-select"
                value={selectedPvzCode}
                onChange={(e) => setSelectedPvzCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                {pvzList.map((pvz) => (
                  <option key={pvz.code} value={pvz.code}>
                    {pvz.name} — {pvz.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional Street / Apartment Address */}
          <div>
            <label htmlFor="street-input" style={{ display: "block", marginBottom: "6px" }}>
              <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
                АДРЕС/КОММЕНТАРИЙ К КУРЬЕРУ (ОПЦИОНАЛЬНО)
              </Typography>
            </label>
            <input
              id="street-input"
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Улица, дом, квартира"
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}

      {validationError && <ErrorNotice message={validationError} compact={true} />}

      <Button type="submit" variant="primary" size="md" isDisabled={loading || !selectedOption}>
        ПОДТВЕРДИТЬ ДОСТАВКУ
      </Button>
    </form>
  );
}
