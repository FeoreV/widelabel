"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner container">
        {/* Left: Brand Logo */}
        <div className="header-brand">
          <Link href="/" className="logo-link" aria-label="WIDE LABEL главная страница">
            WIDE LABEL
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Главная навигация">
          <ul className="nav-list">
            <li>
              <Link href="#catalog" className="nav-link">
                КАТАЛОГ
              </Link>
            </li>
            <li>
              <Link href="#collections" className="nav-link">
                КОЛЛЕКЦИИ
              </Link>
            </li>
            <li>
              <Link href="#about" className="nav-link">
                О НАС
              </Link>
            </li>
            <li>
              <Link href="#shipping" className="nav-link">
                ДОСТАВКА
              </Link>
            </li>
            <li>
              <Link href="#contacts" className="nav-link">
                КОНТАКТЫ
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="action-btn"
            aria-label="Поиск по сайту"
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            type="button"
            className="action-btn"
            aria-label="Личный кабинет"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <button
            type="button"
            className="action-btn cart-action-btn"
            aria-label="Корзина, 0 товаров"
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
              0
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
            <li>
              <Link
                href="#catalog"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                КАТАЛОГ
              </Link>
            </li>
            <li>
              <Link
                href="#collections"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                КОЛЛЕКЦИИ
              </Link>
            </li>
            <li>
              <Link
                href="#about"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                О НАС
              </Link>
            </li>
            <li>
              <Link
                href="#shipping"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ДОСТАВКА
              </Link>
            </li>
            <li>
              <Link
                href="#contacts"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                КОНТАКТЫ
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
