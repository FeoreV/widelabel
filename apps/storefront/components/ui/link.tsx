import React from "react";
import NextLink from "next/link";

export type LinkVariant = "nav" | "editorial" | "subtle" | "primary";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: LinkVariant;
  external?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<LinkVariant, React.CSSProperties> = {
  nav: {
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
  },
  editorial: {
    fontFamily: "var(--font-display)",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "var(--text-primary)",
    textTransform: "uppercase",
  },
  subtle: {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
  },
  primary: {
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "var(--accent-lime)",
    textTransform: "uppercase",
  },
};

export function Link({
  href,
  variant = "nav",
  external = false,
  active = false,
  children,
  className = "",
  style,
  ...props
}: LinkProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    minHeight: "44px",
    padding: "0 2px",
    textDecoration: "none",
    transition: "color 0.2s ease, border-color 0.2s ease",
    outline: "none",
    color: active ? "var(--text-primary)" : undefined,
    ...variantStyles[variant],
    ...style,
  };

  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`wl-link wl-link-${variant} ${active ? "wl-link-active" : ""} ${className}`}
        style={baseStyle}
        {...props}
      >
        {children}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={`wl-link wl-link-${variant} ${active ? "wl-link-active" : ""} ${className}`}
      style={baseStyle}
      {...(props as any)}
    >
      {children as any}
    </NextLink>
  );
}
