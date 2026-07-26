import React from "react";

export type BadgeStatus = "available" | "reserved" | "sold" | "error" | "waitlist" | "neutral" | "unavailable";
export type BadgeVariant = "pill" | "square" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: BadgeVariant;
  label?: string;
  dot?: boolean;
  children?: React.ReactNode;
}

const statusColorMap: Record<BadgeStatus, { bg: string; text: string; border: string; dot: string }> = {
  available: {
    bg: "rgba(204, 255, 0, 0.12)",
    text: "#ccff00",
    border: "rgba(204, 255, 0, 0.3)",
    dot: "#ccff00",
  },
  reserved: {
    bg: "rgba(234, 179, 8, 0.12)",
    text: "#eab308",
    border: "rgba(234, 179, 8, 0.3)",
    dot: "#eab308",
  },
  sold: {
    bg: "rgba(93, 95, 102, 0.18)",
    text: "#8c8e96",
    border: "rgba(93, 95, 102, 0.3)",
    dot: "#5d5f66",
  },
  unavailable: {
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#ef4444",
    border: "rgba(239, 68, 68, 0.3)",
    dot: "#ef4444",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#ef4444",
    border: "rgba(239, 68, 68, 0.3)",
    dot: "#ef4444",
  },
  waitlist: {
    bg: "rgba(59, 130, 246, 0.12)",
    text: "#3b82f6",
    border: "rgba(59, 130, 246, 0.3)",
    dot: "#3b82f6",
  },
  neutral: {
    bg: "rgba(255, 255, 255, 0.06)",
    text: "var(--text-secondary)",
    border: "var(--border-subtle)",
    dot: "#8c8e96",
  },
};

export function Badge({
  status = "available",
  variant = "pill",
  label,
  dot = true,
  children,
  className = "",
  style,
  ...props
}: BadgeProps) {
  const colors = statusColorMap[status] || statusColorMap.neutral;

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: variant === "pill" ? "3px 10px" : "4px 8px",
    borderRadius: variant === "pill" ? "var(--radius-full)" : "var(--radius-sm)",
    backgroundColor: variant === "outline" ? "transparent" : colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    fontFamily: "var(--font-sans)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    ...style,
  };

  return (
    <span
      className={`wl-badge wl-badge-${status} wl-badge-${variant} ${className}`}
      style={baseStyle}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: colors.dot,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {children || label}
    </span>
  );
}

export function StatusBadge({ status, label, className }: { status: BadgeStatus; label?: string; className?: string }) {
  const defaultLabels: Record<BadgeStatus, string> = {
    available: "1-OF-1 AVAILABLE",
    reserved: "RESERVED (HOLD)",
    sold: "SOLD OUT / ARCHIVE",
    unavailable: "UNAVAILABLE",
    error: "ERROR",
    waitlist: "WAITLIST OPEN",
    neutral: "CONCEPT",
  };

  return <Badge status={status} label={label || defaultLabels[status]} className={className} />;
}
