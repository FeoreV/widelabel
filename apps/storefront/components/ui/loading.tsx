import React from "react";

export interface LoadingSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 32,
};

export function LoadingSpinner({
  size = "md",
  color = "var(--accent-lime)",
  className = "",
  style,
  ...props
}: LoadingSpinnerProps) {
  const dimension = sizeMap[size] || 20;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      className={`wl-spinner wl-spinner-${size} ${className}`}
      style={{
        animation: "spin 0.8s linear infinite",
        color: color,
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.2405 2.73823 16.3082 3.98774 17.9823"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "text" | "circular";
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  aspectRatio,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-surface-elevated)",
    borderRadius:
      variant === "circular"
        ? "50%"
        : variant === "text"
        ? "var(--radius-sm)"
        : "var(--radius-sm)",
    width: width || (variant === "text" ? "100%" : "100%"),
    height: height || (variant === "text" ? "12px" : "auto"),
    aspectRatio: aspectRatio,
    animation: "pulseSkeleton 1.5s infinite ease-in-out",
    ...style,
  };

  return <div className={`wl-skeleton wl-skeleton-${variant} ${className}`} style={defaultStyle} {...props} />;
}
