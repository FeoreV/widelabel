import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function Container({
  as: Component = "div",
  children,
  className = "",
  style,
  ...props
}: ContainerProps) {
  const defaultStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "var(--container-max-width)",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "40px",
    paddingRight: "40px",
    ...style,
  };

  return (
    <Component className={`container ${className}`} style={defaultStyle} {...props}>
      {children}
    </Component>
  );
}
