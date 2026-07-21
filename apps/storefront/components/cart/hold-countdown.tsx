"use client";

import { useEffect, useState } from "react";

export interface HoldCountdownProps {
  reservedUntil: string;
  serverTime?: string;
  onExpired?: () => void;
}

export function HoldCountdown({
  reservedUntil,
  serverTime,
  onExpired,
}: HoldCountdownProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    const target = new Date(reservedUntil).getTime();
    const serverMs = serverTime ? new Date(serverTime).getTime() : Date.now();
    const offsetMs = serverMs - Date.now();
    return Math.max(0, target - (Date.now() + offsetMs));
  });

  useEffect(() => {
    const target = new Date(reservedUntil).getTime();
    const serverMs = serverTime ? new Date(serverTime).getTime() : Date.now();
    const offsetMs = serverMs - Date.now();

    const interval = setInterval(() => {
      const remaining = Math.max(0, target - (Date.now() + offsetMs));
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservedUntil, serverTime, onExpired]);

  if (timeLeftMs <= 0) {
    return (
      <span style={{ color: "#e53e3e", fontWeight: "bold" }}>
        Reservation Expired
      </span>
    );
  }

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <span style={{ color: "#2b6cb0", fontWeight: "bold", fontFamily: "monospace" }}>
      Hold Expires In: {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
}
