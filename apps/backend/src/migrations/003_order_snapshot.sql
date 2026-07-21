-- Migration 003: OrderSnapshot schema
CREATE TABLE IF NOT EXISTS wl_order_snapshot (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  variant_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  measurements JSONB NOT NULL,
  defects JSONB NOT NULL,
  media_checksums JSONB NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wl_order_snapshot_order_id ON wl_order_snapshot(order_id);
