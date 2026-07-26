import React from "react";

export type TypographyVariant =
  | "headline-display"
  | "headline-lg"
  | "headline-md"
  | "title-lg"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "caption"
  | "label";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  children?: React.ReactNode;
}

const variantTagMap: Record<TypographyVariant, React.ElementType> = {
  "headline-display": "h1",
  "headline-lg": "h2",
  "headline-md": "h3",
  "title-lg": "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  caption: "span",
  label: "span",
};

const variantStyleMap: Record<TypographyVariant, React.CSSProperties> = {
  "headline-display": {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2.2rem, 3.6vw, 3.6rem)",
    fontWeight: 700,
    lineHeight: 0.98,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
  },
  "headline-lg": {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.8rem, 2.5vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.0,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
  },
  "headline-md": {
    fontFamily: "var(--font-display)",
    fontSize: "26px",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
  },
  "title-lg": {
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
  },
  "body-lg": {
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: "0.02em",
    color: "var(--text-primary)",
  },
  "body-md": {
    fontFamily: "var(--font-sans)",
    fontSize: "13px",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    color: "var(--text-secondary)",
  },
  "body-sm": {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: "0.02em",
    color: "var(--text-secondary)",
  },
  caption: {
    fontFamily: "var(--font-sans)",
    fontSize: "10px",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
  },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
  },
};

export function Typography({
  variant = "body-md",
  as,
  children,
  className = "",
  style,
  ...props
}: TypographyProps) {
  const Component = as || variantTagMap[variant] || "span";
  const defaultStyle = variantStyleMap[variant] || variantStyleMap["body-md"];

  return (
    <Component
      className={`wl-typography wl-typography-${variant} ${className}`}
      style={{ ...defaultStyle, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}
