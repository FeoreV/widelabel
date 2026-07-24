"use client";

import { useState } from "react";
import { ApiWaitlistAdapter, type IWaitlistAdapter } from "../../lib/waitlist/adapter";

export interface WaitlistFormProps {
  variantId: string;
  adapter?: IWaitlistAdapter;
}

export function WaitlistForm({
  variantId,
  adapter = new ApiWaitlistAdapter(),
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<"email" | "telegram" | "both">("email");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await adapter.joinWaitlist({
        variant_id: variantId,
        email,
        channel,
        consent_version: "v1.0",
      });
      setSuccessMessage(res.message || "You have been added to the waitlist!");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to join waitlist. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1.25rem",
        backgroundColor: "#f7fafc",
        marginTop: "1.5rem",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#2d3748" }}>
        Item Currently Unavailable / Reserved
      </h3>
      <p style={{ fontSize: "0.875rem", color: "#4a5568", marginBottom: "1rem" }}>
        Join the priority waitlist to be notified instantly if this 1-of-1 piece becomes available.
      </p>

      {successMessage ? (
        <div
          style={{
            color: "#276749",
            backgroundColor: "#c6f6d5",
            padding: "0.75rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          {successMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #cbd5e0",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
              Notification Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #cbd5e0",
              }}
            >
              <option value="email">Email Only</option>
              <option value="telegram">Telegram</option>
              <option value="both">Both Email & Telegram</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem",
              backgroundColor: "#2d3748",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Joining Waitlist..." : "Notify Me If Released"}
          </button>

          {error && (
            <p style={{ color: "#e53e3e", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
