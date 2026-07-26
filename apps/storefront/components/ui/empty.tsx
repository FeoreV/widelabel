import React from "react";
import { Typography } from "./typography";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  title = "ARCHIVE ITEM NOT FOUND",
  description = "No 1-of-1 pieces match the specified criteria in current drop.",
  action,
  icon,
  compact = false,
  className = "",
  style,
  ...props
}: EmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: compact ? "24px 16px" : "48px 24px",
    backgroundColor: "var(--bg-surface)",
    border: "1px dashed var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    width: "100%",
    ...style,
  };

  return (
    <div className={`wl-empty-state ${compact ? "wl-empty-state-compact" : ""} ${className}`} style={containerStyle} {...props}>
      {icon ? (
        <div style={{ marginBottom: "12px", color: "var(--text-tertiary)" }}>{icon}</div>
      ) : (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="1.5"
          style={{ marginBottom: "12px" }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
      )}
      <Typography variant="title-lg" style={{ marginBottom: "6px" }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body-sm" style={{ maxWidth: "420px", marginBottom: action ? "16px" : "0" }}>
          {description}
        </Typography>
      )}
      {action && <div style={{ marginTop: "12px" }}>{action}</div>}
    </div>
  );
}
