-- Migration 004: PaymentAttempt schema
CREATE TABLE IF NOT EXISTS wide_label_payment_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id varchar(64) NOT NULL,
  reservation_id varchar(64) NOT NULL,
  provider varchar(50) NOT NULL,
  provider_payment_id varchar(255),
  status varchar(50) NOT NULL,
  amount numeric NOT NULL,
  currency_code varchar(10) NOT NULL,
  idempotency_key varchar(255) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wl_payment_attempt_idempotency_key ON wide_label_payment_attempt(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_wl_payment_attempt_cart_id ON wide_label_payment_attempt(cart_id);
