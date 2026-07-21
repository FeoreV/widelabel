"use client";

import { useEffect, useRef, useState } from "react";
import type { AvailabilityResponse } from "@wide-label/types";
import { MedusaStorefrontClient } from "../medusa/client";

export interface UseAvailabilityPollingResult {
  availability: AvailabilityResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAvailabilityPolling(
  variantId: string,
  intervalMs = 30000
): UseAvailabilityPollingResult {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestSeqRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAvailability = async () => {
    // Cancel previous pending request to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentSeq = ++requestSeqRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const client = new MedusaStorefrontClient();
      const res = await client.getAvailability(variantId);

      // Stale-response protection: ignore response if a newer request was dispatched
      if (currentSeq === requestSeqRef.current) {
        setAvailability(res);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      if (currentSeq === requestSeqRef.current) {
        setError(err.message || "Failed to fetch availability");
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAvailability();

    // 30-second polling timer
    const interval = setInterval(() => {
      fetchAvailability();
    }, intervalMs);

    // Immediate refresh when window gains focus
    const handleFocus = () => {
      fetchAvailability();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [variantId, intervalMs]);

  return {
    availability,
    loading,
    error,
    refresh: fetchAvailability,
  };
}
