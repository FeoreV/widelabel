DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM
      ('active','payment_pending','released','expired','converted','cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wide_label_reservation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id varchar(64) NOT NULL,
  cart_id varchar(64) NOT NULL,
  customer_id varchar(64),
  session_fingerprint varchar(128),
  status reservation_status NOT NULL,
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  payment_pending_until timestamptz,
  converted_at timestamptz,
  released_at timestamptz,
  release_reason varchar(40),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > reserved_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wl_one_open_reservation_per_variant
ON wide_label_reservation (variant_id)
WHERE status IN ('active','payment_pending');

CREATE INDEX IF NOT EXISTS ix_wl_reservation_expiry
ON wide_label_reservation (expires_at)
WHERE status IN ('active','payment_pending');

CREATE INDEX IF NOT EXISTS ix_wl_reservation_cart
ON wide_label_reservation (cart_id)
WHERE status IN ('active','payment_pending');
