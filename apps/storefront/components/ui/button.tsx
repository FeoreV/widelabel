import React from "react";
import { LoadingSpinner } from "./loading";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--accent-lime)",
    color: "#0a0b0c",
    border: "1px solid var(--accent-lime)",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-strong)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-subtle)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "1px solid transparent",
  },
  danger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: "36px",
    minHeight: "36px",
    padding: "0 16px",
    fontSize: "11px",
  },
  md: {
    height: "44px",
    minHeight: "44px",
    padding: "0 24px",
    fontSize: "12px",
  },
  lg: {
    height: "52px",
    minHeight: "52px",
    padding: "0 32px",
    fontSize: "12px",
  },
};

export function Button({
  variant = "primary",
  size = "lg",
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  style,
  type = "button",
  ...props
}: ButtonProps) {
  const isButtonDisabled = disabled || isDisabled || isLoading;

  const styleObj: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-sans)",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    borderRadius: "var(--radius-sm)",
    transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.1s ease",
    cursor: isButtonDisabled ? "not-allowed" : "pointer",
    opacity: isButtonDisabled ? 0.4 : 1,
    pointerEvents: isButtonDisabled ? "none" : "auto",
    width: fullWidth ? "100%" : "auto",
    whiteSpace: "nowrap",
    outline: "none",
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={`wl-btn wl-btn-${variant} wl-btn-${size} ${fullWidth ? "wl-btn-full" : ""} ${className}`}
      style={styleObj}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color={variant === "primary" ? "#0a0b0c" : "var(--accent-lime)"} />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
