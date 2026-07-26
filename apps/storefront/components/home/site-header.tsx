"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link as LinkPrimitive } from "../ui/link";

export interface SiteHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function SiteHeader({ cartCount = 0, onOpenCart }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: "КАТАЛОГ", href: "/products" },
    { label: "КОЛЛЕКЦИИ", href: "/#collections" },
    { label: "О КОНЦЕПТЕ", href: "/#concept" },
    { label: "ИСТОРИЯ", href: "/#story" },
    { label: "ДОСТАВКА", href: "/#shipping" },
  ];

  return (
    <header className="site-header">
      <div className="header-inner container">
        {/* Left: Brand Logo / Wordmark */}
        <div className="header-brand">
          <Link href="/" className="logo-link" aria-label="WIDE LABEL — главная страница">
            WIDE LABEL
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Главная навигация">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <LinkPrimitive
                  href={item.href}
                  variant="nav"
                  active={pathname === item.href}
                >
                  {item.label}
                </LinkPrimitive>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions (Cart & Mobile Menu Toggle) */}
        <div className="header-actions">
          {/* Cart Button */}
          <button
            type="button"
            className="action-btn cart-action-btn"
            onClick={onOpenCart}
            aria-label={`Корзина, ${cartCount} ${cartCount === 1 ? "товар" : "товаров"}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="cart-badge" aria-hidden="true">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню навигации"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Мобильная навигация">
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
