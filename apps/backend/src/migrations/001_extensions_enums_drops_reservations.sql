-- Migration 001: Extensions, ENUMs, Drops and Reservations
-- This is the canonical first custom migration for WIDE LABEL.
-- Medusa core tables are managed by Medusa itself; this file covers
-- only wide_label_ prefixed custom tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types
CREATE TYPE reservation_status AS ENUM (
  'active',
  'payment_pending',
  'released',
  'expired',
  'converted',
  'cancelled'
);

CREATE TYPE waitlist_channel AS ENUM ('email', 'telegram', 'both');
CREATE TYPE waitlist_status  AS ENUM ('active', 'unsubscribed', 'notified', 'invalid');

-- Drop catalogue
CREATE TABLE wide_label_drop (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         varchar(120) NOT NULL UNIQUE,
  title        varchar(255) NOT NULL,
  description  text         NOT NULL DEFAULT '',
  status       varchar(20)  NOT NULL CHECK (status IN ('draft', 'scheduled', 'live', 'closed')),
  starts_at    timestamptz,
  ends_at      timestamptz,
  hero_image_key text,
  seo_title    varchar(255),
  seo_description varchar(500),
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE wide_label_drop_product (
  drop_id    uuid        NOT NULL REFERENCES wide_label_drop(id) ON DELETE CASCADE,
  product_id varchar(64) NOT NULL,
  sort_order integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (drop_id, product_id)
);

-- Inventory reservation
CREATE TABLE wide_label_reservation (
  id                    uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id            varchar(64)      NOT NULL,
  cart_id               varchar(64)      NOT NULL,
  customer_id           varchar(64),
  session_fingerprint   varchar(128),
  status                reservation_status NOT NULL,
  reserved_at           timestamptz      NOT NULL DEFAULT now(),
  expires_at            timestamptz      NOT NULL,
  payment_pending_until timestamptz,
  converted_at          timestamptz,
  released_at           timestamptz,
  release_reason        varchar(40),
  created_at            timestamptz      NOT NULL DEFAULT now(),
  updated_at            timestamptz      NOT NULL DEFAULT now(),
  CHECK (expires_at > reserved_at)
);

-- Partial unique index: at most one open reservation per variant
CREATE UNIQUE INDEX uq_wl_one_open_reservation_per_variant
  ON wide_label_reservation (variant_id)
  WHERE status IN ('active', 'payment_pending');

CREATE INDEX ix_wl_reservation_expiry
  ON wide_label_reservation (expires_at)
  WHERE status IN ('active', 'payment_pending');

CREATE INDEX ix_wl_reservation_cart
  ON wide_label_reservation (cart_id)
  WHERE status IN ('active', 'payment_pending');
