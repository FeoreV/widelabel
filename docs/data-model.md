## 2. Data Schema

Medusa core tables остаются управляемыми Medusa. Ниже перечислены WIDE LABEL entities и связи. Для custom module используется Medusa data model/ORM; SQL-ограничения из миграции обязательны независимо от ORM.

### 2.1 Product и ProductVariant

Используется Medusa `Product` + `ProductVariant`:

- `product.id`: canonical product id.
- `product.handle`, `title`, `description`, `status`, `thumbnail`.
- `product.metadata.brand`: string.
- `product.metadata.era`: enum-like string, например `1940s`, `1950s`, `unknown`.
- `product.metadata.condition_rating`: integer 1..5.
- `product.metadata.condition_label`: `deadstock | excellent | good | worn | restored`.
- `product.metadata.archival_notes`: markdown/plain text.
- `product.metadata.composition`: text.
- `product.metadata.defects`: array of structured defect records.
- `product.metadata.measurements_json`: versioned JSON object.
- `product.metadata.item_id`: immutable human-readable inventory id.
- `variant.sku`: equal to `item_id`.
- `variant.manage_inventory`: true.
- inventory level: exactly 1 sellable unit.

Recommended measurements payload:

```json
{
  "version": 1,
  "unit": "cm",
  "fields": {
    "chest": 58,
    "shoulders": 47,
    "length": 72,
    "sleeve": 63,
    "waist": null,
    "inseam": null
  },
  "notes": "Measured flat; allow ±1 cm."
}
```

Images are stored in S3, with product media metadata: `kind = cover | detail | label | defect | archival`, `sort_order`, `alt`, `sha256`, `width`, `height`. The URL alone is insufficient for snapshots: snapshot stores the URL, object key, checksum and media kind.

### 2.2 Drop

```text
Drop
- id uuid primary key
- slug varchar(120) unique not null
- title varchar(255) not null
- description text not null default ''
- status varchar(20) not null check (draft|scheduled|live|closed)
- starts_at timestamptz null
- ends_at timestamptz null
- hero_image_key text null
- seo_title varchar(255) null
- seo_description varchar(500) null
- created_at timestamptz not null
- updated_at timestamptz not null
```

`DropProduct` связывает drop и Medusa product. Один продукт может находиться максимум в одном активном drop, но может иметь архивные связи.

### 2.3 Reservation

```text
Reservation
- id uuid primary key
- variant_id varchar(64) not null
- cart_id varchar(64) not null
- customer_id varchar(64) null
- session_fingerprint varchar(128) null
- status reservation_status not null
- reserved_at timestamptz not null
- expires_at timestamptz not null
- payment_pending_until timestamptz null
- converted_at timestamptz null
- released_at timestamptz null
- release_reason varchar(40) null
- created_at timestamptz not null
- updated_at timestamptz not null
```

Статусы: `active`, `payment_pending`, `released`, `expired`, `converted`, `cancelled`. Для active/payment_pending действует partial unique index. Срок рассчитывается сервером из `clock_timestamp()`, клиентское время не доверяется.

### 2.4 WaitlistEntry

```text
WaitlistEntry
- id uuid primary key
- variant_id varchar(64) not null
- email varchar(320) null
- telegram_chat_id varchar(64) null
- channel waitlist_channel not null
- normalized_contact varchar(320) not null
- status waitlist_status not null
- consent_version varchar(32) not null
- confirmed_at timestamptz null
- notified_at timestamptz null
- last_notification_event_id uuid null
- created_at timestamptz not null
- updated_at timestamptz not null
```

`channel`: `email | telegram | both`. Для `both` создаются две delivery records, но одна подписка. Дедупликация: `variant_id + normalized_contact + active`.

### 2.5 OrderSnapshot

```text
OrderSnapshot
- id uuid primary key
- order_id varchar(64) unique not null
- variant_id varchar(64) not null
- product_id varchar(64) not null
- item_id varchar(120) not null
- title text not null
- brand text null
- era text null
- condition_rating smallint null
- condition_label text null
- archival_notes text null
- defects_json jsonb not null
- measurements_json jsonb not null
- media_json jsonb not null
- price_amount numeric(20,4) not null
- currency_code char(3) not null
- consent_text text not null
- consent_version varchar(32) not null
- consent_accepted_at timestamptz not null
- customer_email text null
- customer_ip inet null
- customer_user_agent text null
- created_at timestamptz not null
```

В application code snapshot не имеет update endpoint. Исправление возможно только миграцией/административной процедурой с audit log, не обычным CRUD.

### 2.6 PaymentAttempt и NotificationDelivery

```text
PaymentAttempt
- id uuid primary key
- order_id varchar(64) not null
- provider varchar(32) not null default 'yookassa'
- provider_payment_id varchar(128) null
- status varchar(32) not null
- amount numeric(20,4) not null
- currency_code char(3) not null
- idempotency_key varchar(128) unique not null
- raw_status jsonb null
- created_at timestamptz not null
- updated_at timestamptz not null

NotificationDelivery
- id uuid primary key
- event_id uuid not null
- waitlist_entry_id uuid not null
- channel varchar(16) not null
- status varchar(16) not null
- provider_message_id varchar(255) null
- attempts integer not null default 0
- sent_at timestamptz null
- last_error text null
- created_at timestamptz not null
- updated_at timestamptz not null
```

### 2.7 SQL migration

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE reservation_status AS ENUM
  ('active','payment_pending','released','expired','converted','cancelled');
CREATE TYPE waitlist_channel AS ENUM ('email','telegram','both');
CREATE TYPE waitlist_status AS ENUM ('active','unsubscribed','notified','invalid');

CREATE TABLE wide_label_drop (
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

CREATE TABLE wide_label_drop_product (
  drop_id uuid NOT NULL REFERENCES wide_label_drop(id) ON DELETE CASCADE,
  product_id varchar(64) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (drop_id, product_id)
);

CREATE TABLE wide_label_reservation (
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

CREATE UNIQUE INDEX uq_wl_one_open_reservation_per_variant
ON wide_label_reservation (variant_id)
WHERE status IN ('active','payment_pending');

CREATE INDEX ix_wl_reservation_expiry
ON wide_label_reservation (expires_at)
WHERE status IN ('active','payment_pending');

CREATE INDEX ix_wl_reservation_cart
ON wide_label_reservation (cart_id)
WHERE status IN ('active','payment_pending');

CREATE TABLE wide_label_waitlist_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id varchar(64) NOT NULL,
  email varchar(320),
  telegram_chat_id varchar(64),
  channel waitlist_channel NOT NULL,
  normalized_contact varchar(320) NOT NULL,
  status waitlist_status NOT NULL DEFAULT 'active',
  consent_version varchar(32) NOT NULL,
  confirmed_at timestamptz,
  notified_at timestamptz,
  last_notification_event_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR telegram_chat_id IS NOT NULL)
);

CREATE UNIQUE INDEX uq_wl_waitlist_active_contact
ON wide_label_waitlist_entry (variant_id, normalized_contact)
WHERE status = 'active';

CREATE TABLE wide_label_order_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar(64) NOT NULL UNIQUE,
  variant_id varchar(64) NOT NULL,
  product_id varchar(64) NOT NULL,
  item_id varchar(120) NOT NULL,
  title text NOT NULL,
  brand text,
  era text,
  condition_rating smallint CHECK (condition_rating IS NULL OR condition_rating BETWEEN 1 AND 5),
  condition_label text,
  archival_notes text,
  defects_json jsonb NOT NULL,
  measurements_json jsonb NOT NULL,
  media_json jsonb NOT NULL,
  price_amount numeric(20,4) NOT NULL,
  currency_code char(3) NOT NULL,
  consent_text text NOT NULL,
  consent_version varchar(32) NOT NULL,
  consent_accepted_at timestamptz NOT NULL,
  customer_email text,
  customer_ip inet,
  customer_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wide_label_payment_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar(64) NOT NULL,
  provider varchar(32) NOT NULL DEFAULT 'yookassa',
  provider_payment_id varchar(128),
  status varchar(32) NOT NULL,
  amount numeric(20,4) NOT NULL,
  currency_code char(3) NOT NULL,
  idempotency_key varchar(128) NOT NULL UNIQUE,
  raw_status jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wide_label_notification_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  waitlist_entry_id uuid NOT NULL REFERENCES wide_label_waitlist_entry(id),
  channel varchar(16) NOT NULL CHECK (channel IN ('email','telegram')),
  status varchar(16) NOT NULL CHECK (status IN ('queued','sent','failed','skipped')),
  provider_message_id varchar(255),
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, waitlist_entry_id, channel)
);
```

