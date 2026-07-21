"use client";

import { useEffect, useState } from "react";
import { FakeShippingProvider, type IShippingProvider, type ShippingOption } from "../../lib/shipping/provider";

export interface ShippingStepProps {
  provider?: IShippingProvider;
  onSelectOption?: (option: ShippingOption) => void;
}

export function ShippingStep({
  provider = new FakeShippingProvider(),
  onSelectOption,
}: ShippingStepProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    provider.getAvailableOptions().then((opts) => {
      setOptions(opts);
      if (opts.length > 0) {
        setSelectedId(opts[0].id);
        onSelectOption?.(opts[0]);
      }
      setLoading(false);
    });
  }, []);

  const handleSelect = (opt: ShippingOption) => {
    setSelectedId(opt.id);
    onSelectOption?.(opt);
  };

  if (loading) {
    return <p>Loading shipping methods...</p>;
  }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h2>Select Shipping Method</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        {options.map((opt) => (
          <label
            key={opt.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "6px",
              border: selectedId === opt.id ? "2px solid #2b6cb0" : "1px solid #cbd5e0",
              backgroundColor: selectedId === opt.id ? "#ebf8ff" : "#ffffff",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="radio"
                name="shipping_option"
                checked={selectedId === opt.id}
                onChange={() => handleSelect(opt)}
              />
              <div>
                <strong style={{ display: "block" }}>{opt.name}</strong>
                <span style={{ fontSize: "0.875rem", color: "#718096" }}>Est. {opt.estimated_days}</span>
              </div>
            </div>

            <span style={{ fontWeight: "bold" }}>
              {opt.price} {opt.currency_code}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
