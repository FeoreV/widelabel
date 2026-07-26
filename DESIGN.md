---
name: WIDE LABEL Visual Foundation
version: 1.0.0
description: Single source of truth for WIDE LABEL 1-of-1 fashion archive concept store visual language.
colors:
  bg-primary: "#0a0b0c"
  bg-surface: "#111315"
  bg-surface-elevated: "#16181b"
  text-primary: "#f0f0ec"
  text-secondary: "#8c8e96"
  text-tertiary: "#5d5f66"
  accent-lime: "#ccff00"
  accent-lime-hover: "#b8e600"
  accent-lime-muted: "rgba(204, 255, 0, 0.08)"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.18)"
  border-focus: "#ccff00"
  state-available: "#ccff00"
  state-reserved: "#eab308"
  state-sold: "#5d5f66"
  state-error: "#ef4444"
  state-waitlist: "#3b82f6"
  state-empty: "#8c8e96"
typography:
  headline-display:
    fontFamily: "Oswald, Impact, sans-serif"
    fontSize: "57px"
    fontWeight: 700
    lineHeight: "0.98"
    letterSpacing: "0.02em"
  headline-lg:
    fontFamily: "Oswald, Impact, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "1.0"
    letterSpacing: "0.04em"
  headline-md:
    fontFamily: "Oswald, Impact, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "0.06em"
  title-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "0.08em"
  body-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.02em"
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0.01em"
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "0.1em"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "0.12em"
rounded:
  none: "0px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  full: "9999px"
spacing:
  3xs: "2px"
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
  3xl: "48px"
  4xl: "64px"
  5xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent-lime}"
    textColor: "#0a0b0c"
    rounded: "{rounded.sm}"
    padding: "0 32px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.sm}"
    padding: "0 32px"
    height: "52px"
  badge:
    rounded: "{rounded.full}"
    padding: "2px 8px"
  container:
    maxWidth: "1536px"
    paddingDesktop: "40px"
    paddingMobile: "16px"
---

# WIDE LABEL Visual Foundation

## Overview
WIDE LABEL is a 1-of-1 concept store for selective second-hand fashion. Every piece is strictly unique (single unit inventory).
The visual identity is designed as a **fashion archive** and **editorial boutique**, NOT a generic marketplace or standard SaaS dashboard.

### Core Aesthetic Principles
1. **Sharp Luxury Geometry**: Sharp to minimal corner radii (0px - 4px). No soft rounded cards.
2. **Editorial High-Contrast Palette**: Deep dark background (`#0a0b0c`), clean text hierarchy (`#f0f0ec`), subtle structural borders, and electric lime accent (`#ccff00`).
3. **Air & Spatial Rhythm**: Generous whitespace, precise typography scaling, clear architectural grid.
4. **Imagery First**: Clean dark frames, high-contrast imagery presentation, non-distracting fallbacks.
5. **No AI Clichés**: Zero purple/indigo gradients, zero mesh blobs, zero decorative glassmorphism, zero bento grid templates.

---

## Colors

### Base Palette
- **Primary Background (`#0a0b0c`):** Ultra-dark charcoal foundation.
- **Surface (`#111315`):** Structural container background.
- **Surface Elevated (`#16181b`):** Image wrappers, card bases, elevated drawers.

### Typography Colors
- **Text Primary (`#f0f0ec`):** Off-white, primary reading color.
- **Text Secondary (`#8c8e96`):** Cool gray for metadata, descriptions, subheadings.
- **Text Tertiary (`#5d5f66`):** Muted gray for timestamps, subtle notes, disabled states.

### Brand Accent
- **Accent Lime (`#ccff00`):** Electric lime driver for primary actions, active focus rings, available 1-of-1 badges.
- **Accent Lime Hover (`#b8e600`):** Darker lime for active hover states.
- **Accent Lime Muted (`rgba(204, 255, 0, 0.08)`):** Subtle tint for active selections and highlighted slots.

### Borders
- **Border Subtle (`rgba(255, 255, 255, 0.08)`):** Architectural grid dividers, subtle card borders.
- **Border Strong (`rgba(255, 255, 255, 0.18)`):** Secondary button outlines, hover state borders.
- **Border Focus (`#ccff00`):** High-contrast keyboard focus indicator.

### Status Colors
- **Available 1-of-1 (`#ccff00`):** Lime status tag indicating item is ready to collect.
- **Reserved / Hold (`#eab308`):** Warm amber indicating active cart reservation timer.
- **Sold / Archived (`#5d5f66`):** Muted gray for archived 1-of-1 pieces.
- **Error / Notice (`#ef4444`):** Crisp red for stock out or validation issues.
- **Waitlist (`#3b82f6`):** Clean blue for notify-me / drop waitlists.

---

## Typography

### Font Families
- **Display (`--font-display`):** `Oswald`, `Impact`, `Arial Narrow`, sans-serif. Used for editorial headers, logo, brand section titles, uppercase impact statements.
- **Sans (`--font-sans`):** `Inter`, -apple-system, BlinkMacSystemFont, sans-serif. Used for body text, price tags, controls, buttons, metadata.

### Typography Scale
- **Headline Display:** 57px / line-height 0.98 / uppercase / letter-spacing 0.02em (Hero H1)
- **Headline Large:** 36px / line-height 1.0 / uppercase / letter-spacing 0.04em (Major Section Headings)
- **Headline Medium:** 26px / line-height 1.1 / uppercase / letter-spacing 0.06em (Section Titles, Drawer Headers)
- **Title Large:** 14px / line-height 1.2 / uppercase / letter-spacing 0.08em / weight 700 (Card Titles, Product Headers)
- **Body Large:** 14px / line-height 1.5 / weight 500 (Lead text, key descriptions)
- **Body Medium:** 13px / line-height 1.5 / weight 400 (General body copy, product specs)
- **Body Small:** 11px / line-height 1.4 / weight 400 (Secondary details, footer links)
- **Label / Tag:** 11px / line-height 1.2 / uppercase / letter-spacing 0.12em / weight 700 (Badges, buttons, filters)
- **Caption:** 10px / line-height 1.3 / uppercase / letter-spacing 0.10em / weight 600 (Meta tags, counters, category labels)

---

## Layout & Grid

- **Max Container Width:** 1536px (`var(--container-max-width)`)
- **Desktop Container Padding:** 40px horizontal
- **Mobile Container Padding:** 16px horizontal
- **Header Height Desktop:** 82px (`var(--header-height-desktop)`)
- **Header Height Mobile:** 58px (`var(--header-height-mobile)`)
- **Grid Systems:**
  - Split Hero / Main Grid: 2-column on desktop (`1fr 1fr` gap 36px), single-column stacked on tablet/mobile.
  - Catalog / Product Grids: 4-column desktop (`repeat(4, 1fr)` gap 12px), 2-column mobile (`repeat(2, 1fr)` gap 10px).
- **Responsive Breakpoints:**
  - `sm`: 640px
  - `md`: 768px (Mobile navigation threshold)
  - `lg`: 1024px (Grid collapse threshold)
  - `xl`: 1280px (Editorial layout threshold)
  - `2xl`: 1536px (Max container width)

---

## Elevation & Depth

WIDE LABEL uses flat, architectural luxury dark styling instead of heavy drop shadows or floating multi-layered cards.
- **Elevation Layers:**
  - Level 0 (Base): `#0a0b0c` (Page background)
  - Level 1 (Surface): `#111315` (Cards, drawers, feature strip)
  - Level 2 (Elevated): `#16181b` (Image containers, modal overlays)
  - Level 3 (Header): `rgba(10, 11, 12, 0.95)` with `backdrop-filter: blur(12px)` + 1px subtle bottom border.
- **Borders over Shadows:** Depth is established via crisp `1px` subtle borders (`rgba(255, 255, 255, 0.08)`) and surface background contrast, NOT fuzzy ambient shadows.

---

## Shapes & Radii

To maintain an editorial fashion archive feel, corner radii are kept sharp and controlled:
- **Sharp (`0px / 2px`):** Default for cards, product images, inputs, primary and secondary buttons (`2px`).
- **Control Radii (`3px / 4px`):** Compact controls, icon action buttons, notice boxes (`3px - 4px`).
- **Pills / Status Badges (`9999px`):** Reserved strictly for circular badges, pill tags, and numeric counters.

---

## Motion & Interaction

- **Duration:**
  - Fast feedback (hover, active press): `100ms - 200ms ease`
  - Structural transitions (drawer slide, fade): `250ms - 350ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Properties:** Animate only GPU-accelerated properties (`opacity`, `transform`, `border-color`, `color`, `background-color`).
- **Prefers-Reduced-Motion:** Fully respected via global media query setting all animation and transition durations to `0.01ms`.

---

## Focus & Accessibility

- **Keyboard Focus:** High-contrast outline: `outline: 2px solid #ccff00; outline-offset: 3px;` on `:focus-visible`.
- **Touch Targets:** All interactive links, buttons, and toggle targets MUST maintain a minimum height/width of `44px` on touch devices.
- **Disabled States:** `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`, no hover or focus effects.
- **Loading States:** Explicit spinners or pulsing skeleton frames (`animation: pulseSkeleton 1.5s infinite ease-in-out`).

---

## Product Imagery & Archive Rules

1. **Aspect Ratio:** Standardized product frames at `1 / 1.12` or `1 / 1`.
2. **Container:** `#16181b` background with `1px solid rgba(255, 255, 255, 0.08)` border and `2px` radius.
3. **Hover Micro-interaction:** Image scales to `1.04` over `350ms ease`, frame border shifts to `rgba(255, 255, 255, 0.18)`.
4. **Fallback Handling:** Clean dark backdrop with brand tag and dashed subtle border if image is loading or missing.

---

## States & Statuses

- **Available (1-of-1):** Lime tag (`#ccff00`), prominent "ADD TO CART" or "RESERVE" CTA.
- **Reserved (In Cart / Payment Pending):** Amber timer tag (`#eab308`), hold countdown timer visible.
- **Sold Out / Archived:** Muted gray badge (`#5d5f66`), disabled button with "SOLD OUT" text or "JOIN WAITLIST".
- **Error State:** Compact inline notice with subtle red/lime icon and crisp diagnostic text.
- **Empty State:** Minimalist archive frame with dashed border, icon, and clear action button.

---

## Components Specification

### 1. Typography (`Typography`, `Heading`, `Text`)
Renders semantic HTML (`h1`..`h6`, `p`, `span`) with normalized font classes.

### 2. Button (`Button`)
Supports `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`), `isLoading`, `isDisabled`, `fullWidth`, with full keyboard focus and touch target compliance.

### 3. Link (`LinkPrimitive`)
Supports `href`, `external`, `active`, `variant` (`nav`, `editorial`, `subtle`), with focus-visible and hover states.

### 4. Badge / Status (`Badge`, `StatusBadge`)
Supports status modes (`available`, `reserved`, `sold`, `error`, `waitlist`, `neutral`).

### 5. Container (`Container`)
Wraps content in standard 1536px maximum width with responsive desktop (40px) and mobile (16px) gutters.

### 6. Section (`Section`)
Provides semantic `<section>` wrapper with standardized vertical spacing scales (`sm`, `md`, `lg`, `xl`).

### 7. Divider (`Divider`)
Renders horizontal or vertical architectural line (`1px solid rgba(255, 255, 255, 0.08)`).

### 8. Loading (`LoadingSpinner`, `Skeleton`)
Accessible loading spinners and pulse skeleton placeholders for async content.

### 9. Empty (`EmptyState`)
Dashed dark container with icon, message, and CTA.

### 10. Error (`ErrorNotice`)
Accessible inline or block error notification with clear iconography and message.

### 11. Image Wrapper (`ImageWrapper`)
Aspect-ratio product/editorial image container with fallback state, loading skeleton, and hover scale micro-interaction.

---

## Do's and Don'ts

### DO:
- Maintain sharp luxury geometry (0px - 4px radii).
- Use Electric Lime (`#ccff00`) sparingly for primary actions and focus states.
- Ensure every interactive primitive supports keyboard focus (`:focus-visible`), disabled, and loading states.
- Use semantic HTML tags (`main`, `nav`, `section`, `article`, `header`, `footer`).

### DON'T:
- Don't use purple, indigo, or violet accent colors.
- Don't create rounded cards (8px - 16px border-radius) or soft SaaS bento templates.
- Don't add decorative gradients or glassmorphism blurs in place of clean layout structure.
- Don't swallow errors or use dummy data.
