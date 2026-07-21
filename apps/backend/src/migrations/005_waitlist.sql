-- Migration 005: Create waitlist table with normalization and unique constraints

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id VARCHAR(255) PRIMARY KEY,
  variant_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telegram_handle VARCHAR(255),
  channel VARCHAR(50) NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index for active waitlist email per variant
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_unique_active_email
ON waitlist_entries (variant_id, LOWER(email))
WHERE email IS NOT NULL AND status = 'active';

-- Partial unique index for active waitlist telegram handle per variant
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_unique_active_telegram
ON waitlist_entries (variant_id, LOWER(telegram_handle))
WHERE telegram_handle IS NOT NULL AND status = 'active';
