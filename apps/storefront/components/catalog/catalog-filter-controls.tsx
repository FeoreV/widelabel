"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";

export interface CatalogFilterControlsProps {
  categories?: string[];
  totalCount?: number;
}

const topRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  padding: "16px 20px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
};

const searchFormStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flex: "1 1 240px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px 0 36px",
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: "12px",
  outline: "none",
};

const searchIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "12px",
  top: "11px",
  pointerEvents: "none",
};

const rightControlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const selectStyle: React.CSSProperties = {
  height: "38px",
  padding: "0 12px",
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: "12px",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const mobileToggleStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "38px",
  padding: "0 14px",
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const desktopCategoryBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "12px",
  flexWrap: "wrap",
};

const mobileDrawerStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "16px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export function CatalogFilterControls({
  categories = ["ВЕРХНЯЯ ОДЕЖДА", "СВИТШОТЫ И ХУДИ", "ДЖИНСЫ & ДЕНИМ", "АКСЕССУАРЫ"],
  totalCount,
}: CatalogFilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || searchParams.get("order") || "created_at";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const handleCategorySelect = (cat: string) => {
    const nextCat = currentCategory === cat ? null : cat;
    updateFilters({ category: nextCat });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value });
  };

  const handleReset = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategory || (currentSort && currentSort !== "created_at"));
  const activeCount = [Boolean(currentSearch), Boolean(currentCategory), Boolean(currentSort && currentSort !== "created_at")].filter(Boolean).length;

  return (
    <div className="catalog-controls-bar" style={{ marginBottom: "24px" }}>
      {/* Top Row: Search & Sort Bar */}
      <div style={topRowStyle}>
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} style={searchFormStyle}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по артефактам..."
              aria-label="Поиск по каталогу"
              className="wl-input"
              style={inputStyle}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              style={searchIconStyle}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <Button type="submit" variant="secondary" size="sm">
            НАЙТИ
          </Button>
        </form>

        {/* Desktop Controls: Sort & Mobile Filter Toggle */}
        <div style={rightControlsStyle}>
          {totalCount !== undefined && (
            <Typography variant="caption" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              {totalCount} {totalCount === 1 ? "ПОЗИЦИЯ" : "ПОЗИЦИЙ"}
            </Typography>
          )}

          {/* Sort Selector */}
          <select
            value={currentSort}
            onChange={handleSortChange}
            aria-label="Сортировка каталога"
            style={selectStyle}
          >
            <option value="created_at">СНАЧАЛА НОВЫЕ</option>
            <option value="price_asc">ЦЕНА: ПО ВОЗРАСТАНИЮ</option>
            <option value="price_desc">ЦЕНА: ПО УБЫВАНИЮ</option>
            <option value="title">ПО НАЗВАНИЮ (A-Z)</option>
          </select>

          {/* Mobile Filter Drawer Toggle */}
          <button
            type="button"
            className="mobile-filter-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Фильтры каталога"
            style={mobileToggleStyle}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            ФИЛЬТРЫ {activeCount > 0 && `(${activeCount})`}
          </button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset} style={{ fontSize: "11px", color: "var(--accent-lime)" }}>
              СБРОС
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Category Chips Bar */}
      <div className="desktop-category-bar" style={desktopCategoryBarStyle}>
        <button
          type="button"
          onClick={() => updateFilters({ category: null })}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            backgroundColor: !currentCategory ? "var(--accent-lime)" : "var(--bg-surface)",
            color: !currentCategory ? "#0a0b0c" : "var(--text-secondary)",
            border: `1px solid ${!currentCategory ? "var(--accent-lime)" : "var(--border-subtle)"}`,
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          ВСЕ КАТЕГОРИИ
        </button>

        {categories.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: isSelected ? "var(--accent-lime)" : "var(--bg-surface)",
                color: isSelected ? "#0a0b0c" : "var(--text-secondary)",
                border: `1px solid ${isSelected ? "var(--accent-lime)" : "var(--border-subtle)"}`,
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileOpen && (
        <div style={mobileDrawerStyle}>
          <Typography variant="label" style={{ marginBottom: "4px" }}>
            КАТЕГОРИИ ДРОПА
          </Typography>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                updateFilters({ category: null });
                setIsMobileOpen(false);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                backgroundColor: !currentCategory ? "var(--accent-lime)" : "var(--bg-primary)",
                color: !currentCategory ? "#0a0b0c" : "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              ВСЕ
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  handleCategorySelect(cat);
                  setIsMobileOpen(false);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: currentCategory === cat ? "var(--accent-lime)" : "var(--bg-primary)",
                  color: currentCategory === cat ? "#0a0b0c" : "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                СБРОСИТЬ ВСЁ
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setIsMobileOpen(false)} style={{ marginLeft: "auto" }}>
              ПРИМЕНИТЬ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
