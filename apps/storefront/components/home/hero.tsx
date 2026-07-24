"use client";

import Link from "next/link";
import { useState } from "react";

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
            <span className="eyebrow-text">SELECTIVE SECOND HAND &amp; VINTAGE STORE</span>
          </div>

          <h1 id="hero-title" className="hero-headline">
            ARCHIVE, WORN FORWARD.
          </h1>

          <div className="hero-copy">
            <p>СЕЛЕКТИВНЫЕ ВЕЩИ. РЕАЛЬНАЯ ИСТОРИЯ.</p>
            <p>КАЧЕСТВО, КОТОРОЕ ПРОДОЛЖАЕТ НОСИТЬСЯ.</p>
          </div>

          <div className="hero-actions">
            <Link href="#catalog" className="btn-primary hero-btn-primary">
              СМОТРЕТЬ КАТАЛОГ
            </Link>
            <Link href="#about" className="btn-secondary hero-btn-secondary">
              О НАС
            </Link>
          </div>
        </div>

        {/* Slide Navigation Overlay */}
        <div className="hero-extras" aria-label="Элементы управления">
          {/* Slide Navigation Controls */}
          <div className="hero-slide-controls">
            <span className="slide-counter" aria-live="polite">
              0{currentSlide} / 0{totalSlides}
            </span>
            <div className="slide-buttons">
              <button
                type="button"
                className="slide-btn"
                onClick={handlePrevSlide}
                aria-label="Предыдущий слайд"
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
                aria-label="Следующий слайд"
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
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

