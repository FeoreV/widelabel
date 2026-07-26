import React from "react";

export type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
  as?: React.ElementType;
  children?: React.ReactNode;
}

const spacingMap: Record<SectionSpacing, React.CSSProperties> = {
  none: { paddingTop: 0, paddingBottom: 0 },
  sm: { paddingTop: "24px", paddingBottom: "24px" },
  md: { paddingTop: "36px", paddingBottom: "56px" },
  lg: { paddingTop: "56px", paddingBottom: "80px" },
  xl: { paddingTop: "80px", paddingBottom: "120px" },
};

export function Section({
  spacing = "md",
  as: Component = "section",
  children,
  className = "",
  style,
  ...props
}: SectionProps) {
  const defaultStyle: React.CSSProperties = {
    width: "100%",
    position: "relative",
    ...spacingMap[spacing],
    ...style,
  };

  return (
    <Component className={`wl-section wl-section-${spacing} ${className}`} style={defaultStyle} {...props}>
      {children}
    </Component>
  );
}
