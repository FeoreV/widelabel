-- Migration 003: OrderSnapshot schema
CREATE TABLE IF NOT EXISTS wide_label_order_snapshot (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  variant_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  defects_json JSONB NOT NULL,
  measurements_json JSONB NOT NULL,
  media_json JSONB NOT NULL,
  price_amount NUMERIC NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  consent_text TEXT NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  consent_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wl_order_snapshot_order_id ON wide_label_order_snapshot(order_id);
