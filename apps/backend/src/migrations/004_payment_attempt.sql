-- Migration 004: PaymentAttempt schema
CREATE TABLE IF NOT EXISTS wl_payment_attempt (
  id VARCHAR(255) PRIMARY KEY,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  cart_id VARCHAR(255) NOT NULL,
  reservation_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL,
  external_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wl_payment_attempt_idempotency_key ON wl_payment_attempt(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_wl_payment_attempt_cart_id ON wl_payment_attempt(cart_id);
