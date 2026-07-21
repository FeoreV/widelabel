CREATE TABLE IF NOT EXISTS wide_label_drop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(120) NOT NULL UNIQUE,
  title varchar(255) NOT NULL,
  description text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL CHECK (status IN ('draft','scheduled','live','closed')),
  starts_at timestamptz,
  ends_at timestamptz,
  hero_image_key text,
  seo_title varchar(255),
  seo_description varchar(500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS wide_label_drop_product (
  drop_id uuid NOT NULL REFERENCES wide_label_drop(id) ON DELETE CASCADE,
  product_id varchar(64) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (drop_id, product_id)
);
