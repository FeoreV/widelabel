import React from "react";
import { Typography } from "./typography";
import { Button } from "./button";

export interface ErrorNoticeProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorNotice({
  title = "ARCHIVE API ERROR",
  message,
  onRetry,
  compact = false,
  className = "",
  style,
  ...props
}: ErrorNoticeProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: compact ? "row" : "column",
    alignItems: compact ? "center" : "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: compact ? "12px 16px" : "20px 24px",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "var(--radius-sm)",
    width: "100%",
    color: "#ef4444",
    ...style,
  };

  const headerWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop: compact ? "1px" : "2px",
  };

  const retryButtonStyle: React.CSSProperties = {
    marginTop: compact ? 0 : "8px",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`wl-error-notice ${compact ? "wl-error-notice-compact" : ""} ${className}`}
      style={containerStyle}
      {...props}
    >
      <div style={headerWrapperStyle}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={iconStyle}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          {!compact && title && (
            <Typography variant="label" style={{ color: "#ef4444", marginBottom: "4px" }}>
              {title}
            </Typography>
          )}
          <Typography variant="body-sm" style={{ color: "var(--text-primary)" }}>
            {message}
          </Typography>
        </div>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} style={retryButtonStyle}>
          RETRY
        </Button>
      )}
    </div>
  );
}
