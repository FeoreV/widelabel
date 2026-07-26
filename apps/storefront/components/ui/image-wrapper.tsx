"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "./loading";
import { Typography } from "./typography";

export interface ImageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  aspectRatio?: string;
  hoverScale?: boolean;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  fallbackBrand?: string;
  fallbackTag?: string;
}

export function ImageWrapper({
  src,
  alt = "WIDE LABEL 1-of-1 archive item",
  aspectRatio = "1 / 1.12",
  hoverScale = true,
  priority = false,
  fill = true,
  width,
  height,
  fallbackBrand = "WIDE LABEL ARCHIVE",
  fallbackTag = "1-OF-1 PIECE",
  className = "",
  style,
  ...props
}: ImageWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio,
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
    ...style,
  };

  const fallbackStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "16px",
    backgroundColor: "var(--bg-surface-elevated)",
    textAlign: "center",
  };

  const skeletonStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
  };

  const imageStyle: React.CSSProperties = {
    objectFit: "cover",
    transition: "transform 0.35s ease, opacity 0.35s ease",
    opacity: isLoading ? 0 : 1,
    transform: hoverScale ? "scale(1)" : "none",
  };

  if (!src || hasError) {
    return (
      <div className={`wl-image-fallback ${className}`} style={containerStyle} {...props}>
        <div style={fallbackStyle}>
          <Typography variant="label" style={{ color: "var(--text-secondary)" }}>
            {fallbackBrand}
          </Typography>
          <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
            {fallbackTag}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={`wl-image-wrapper ${hoverScale ? "wl-image-hover" : ""} ${className}`} style={containerStyle} {...props}>
      {isLoading && <Skeleton style={skeletonStyle} />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={imageStyle}
      />
    </div>
  );
}
