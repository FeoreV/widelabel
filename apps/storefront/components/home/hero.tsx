"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 4;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1));
  };

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-container container">
        {/* Editorial Copy & Actions */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-accent" aria-hidden="true" />
            <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
              SELECTIVE SECOND HAND &amp; VINTAGE STORE
            </Typography>
          </div>

          <Typography id="hero-title" variant="headline-display" style={{ marginBottom: "20px" }}>
            ARCHIVE, WORN FORWARD.
          </Typography>

          <div className="hero-copy" style={{ marginBottom: "28px" }}>
            <Typography variant="body-lg" style={{ color: "var(--text-secondary)", display: "block" }}>
              СЕЛЕКТИВНЫЕ ВЕЩИ В ЕДИНСТВЕННОМ ЭКЗЕМПЛЯРЕ.
            </Typography>
            <Typography variant="body-sm" style={{ color: "var(--text-tertiary)", display: "block", marginTop: "4px" }}>
              РЕАЛЬНАЯ ИСТОРИЯ И КАЧЕСТВО, КОТОРОЕ ПРОДОЛЖАЕТ НОСИТЬСЯ.
            </Typography>
          </div>

          <div className="hero-actions">
            <Link href="#catalog" tabIndex={-1}>
              <Button variant="primary" size="lg" className="hero-btn-primary">
                СМОТРЕТЬ КАТАЛОГ
              </Button>
            </Link>
            <Link href="#concept" tabIndex={-1}>
              <Button variant="secondary" size="lg" className="hero-btn-secondary">
                О КОНЦЕПЦИИ
              </Button>
            </Link>
          </div>
        </div>

        {/* Slide Navigation Overlay */}
        <div className="hero-extras" aria-label="Элементы управления архивом">
          <div className="hero-slide-controls">
            <span className="slide-counter" aria-live="polite">
              0{currentSlide} / 0{totalSlides}
            </span>
            <div className="slide-buttons">
              <button
                type="button"
                className="slide-btn"
                onClick={handlePrevSlide}
                aria-label="Предыдущий slide дропа"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <button
                type="button"
                className="slide-btn"
                onClick={handleNextSlide}
                aria-label="Следующий slide дропа"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 19 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
