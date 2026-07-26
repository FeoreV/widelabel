"use client";

import React, { useState } from "react";
import { ImageWrapper } from "../ui/image-wrapper";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  alt?: string;
}

export interface ProductGalleryProps {
  media?: MediaItem[];
  productTitle?: string;
  brandName?: string;
}

export function ProductGallery({
  media = [],
  productTitle = "WIDE LABEL 1-of-1 Piece",
  brandName = "WIDE LABEL ARCHIVE",
}: ProductGalleryProps) {
  if (!media || media.length === 0) {
    return (
      <div className="product-gallery-empty" style={{ width: "100%" }}>
        <ImageWrapper
          src={null}
          alt={productTitle}
          aspectRatio="1 / 1.12"
          fallbackBrand={brandName}
          fallbackTag="1-OF-1 ARCHIVE PIECE"
        />
      </div>
    );
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentItem = media[selectedIndex] || media[0];

  return (
    <div className="product-gallery" style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Featured / Active Media Frame */}
      <div className="gallery-featured-frame" style={{ position: "relative", width: "100%" }}>
        {currentItem.type === "video" ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1.12",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}
          >
            <video
              src={currentItem.url}
              controls
              autoPlay
              muted
              loop
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <ImageWrapper
            src={currentItem.url}
            alt={currentItem.alt || `${productTitle} - Вид ${selectedIndex + 1}`}
            aspectRatio="1 / 1.12"
            priority={true}
            hoverScale={true}
            fallbackBrand={brandName}
          />
        )}
      </div>

      {/* Thumbnail Bar */}
      {media.length > 1 && (
        <div
          className="gallery-thumbnails-bar"
          role="region"
          aria-label="Миниатюры фото товара"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
        >
          {media.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Просмотреть фото ${index + 1} из ${media.length}`}
                aria-pressed={isSelected}
                style={{
                  position: "relative",
                  width: "72px",
                  height: "80px",
                  flexShrink: 0,
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: isSelected ? "2px solid var(--accent-lime)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  padding: 0,
                  cursor: "pointer",
                  opacity: isSelected ? 1 : 0.6,
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
              >
                <img
                  src={item.url}
                  alt={item.alt || `Миниатюра ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
