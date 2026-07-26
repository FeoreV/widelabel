import React from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerSpacing = "none" | "sm" | "md" | "lg";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  spacing?: DividerSpacing;
}

const spacingMap: Record<DividerSpacing, string> = {
  none: "0",
  sm: "12px",
  md: "24px",
  lg: "40px",
};

export function Divider({
  orientation = "horizontal",
  spacing = "none",
  className = "",
  style,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";
  const space = spacingMap[spacing];

  const defaultStyle: React.CSSProperties = {
    backgroundColor: "var(--border-subtle)",
    ...(isHorizontal
      ? {
          width: "100%",
          height: "1px",
          marginTop: space,
          marginBottom: space,
        }
      : {
          width: "1px",
          height: "100%",
          minHeight: "20px",
          marginLeft: space,
          marginRight: space,
        }),
    ...style,
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`wl-divider wl-divider-${orientation} ${className}`}
      style={defaultStyle}
      {...props}
    />
  );
}
