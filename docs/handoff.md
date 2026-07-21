# WIDE LABEL: финальная архитектура и handoff

**Версия:** 1.0.0  
**Дата:** 2026-07-21  
**Статус:** implementation-ready  
**Решение:** Medusa.js 2.x + Next.js App Router + PostgreSQL + Redis/BullMQ + S3-compatible storage

## 0. Архитектурные решения

WIDE LABEL продаёт физические уникальные вещи в модели 1-of-1. Каждый продаваемый экземпляр представлен одним Medusa Product и ровно одним Product Variant с `inventory_quantity = 1`. Размер не является выбираемой вариацией: замеры относятся к самому экземпляру и фиксируются в каталоге и в `OrderSnapshot`.

Medusa остаётся commerce-core: products, variants, carts, orders, inventory, payment sessions, fulfillment и admin. WIDE LABEL-specific логика реализуется отдельным Medusa-модулем и workflows, а не вторым NestJS backend и не отдельной CMS. PostgreSQL является источником истины для состояния товара и резервов. Redis используется только для lock/cache/queue; Redis TTL не меняет бизнес-статус самостоятельно.

Фиксированные правила:

- Cart Hold: 15 минут от успешного атомарного добавления в корзину.
- Один `variant_id` может иметь максимум одну активную бронь.
- Успешный redirect из ЮKassa не означает оплату. Истина: проверенный webhook и повторная сверка статуса.
- Order Snapshot неизменяем после создания.
- Удаление позиции из корзины освобождает резерв немедленно.
- Delayed BullMQ job и минутный sweeper оба обязательны.
- На MVP нет WebSocket: storefront получает `expires_at`, показывает countdown и перепроверяет состояние polling/focus.

## 1. Сервисная архитектура

```text
Browser
  |
  v
Next.js App Router (SSR/ISR, RU storefront)
  |
  | HTTPS, Medusa JS SDK / REST
  v
Medusa.js 2.x (apps/backend)
  |-- Core commerce modules: product, cart, order, inventory, payment, fulfillment
  |-- WIDE LABEL module: drops, reservation, waitlist, snapshots, payment attempts
  |-- Custom API routes and workflows
  |-- BullMQ producers
  |
  +--> PostgreSQL 16: durable commerce and domain state
  +--> Redis 7: distributed lock, cache, BullMQ queues
  +--> S3/MinIO: original images, derivatives, immutable snapshot manifests
  +--> YooKassa REST API: cards and SBP
  +--> CDEK API v2: rates, PVZ, shipment, tracking
  +--> Email provider / Telegram Bot API: async notifications
```

### 1.1 Monorepo

```text
wide-label/
├── apps/
│   ├── storefront/
│   └── backend/
├── packages/
│   ├── types/
│   └── config/
├── infra/
│   ├── docker-compose.yml
│   └── postgres/init/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### 1.2 Полная структура storefront

```text
apps/storefront/
├── app/
│   ├── (shop)/
│   │   ├── page.tsx
│   │   ├── drops/[slug]/page.tsx
│   │   ├── archive/page.tsx
│   │   ├── product/[handle]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── checkout/
│   │       ├── page.tsx
│   │       ├── shipping/page.tsx
│   │       ├── payment/page.tsx
│   │       └── success/page.tsx
│   ├── api/
│   │   ├── revalidate/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── catalog/product-card.tsx
│   ├── catalog/product-grid.tsx
│   ├── product/product-gallery.tsx
│   ├── product/product-facts.tsx
│   ├── product/measurements-table.tsx
│   ├── product/condition-report.tsx
│   ├── product/hold-badge.tsx
│   ├── product/reservation-countdown.tsx
│   ├── cart/cart-drawer.tsx
│   ├── cart/cart-line.tsx
│   ├── checkout/shipping-form.tsx
│   ├── checkout/payment-methods.tsx
│   ├── checkout/consent-checkboxes.tsx
│   ├── checkout/cdek-pvz-picker.tsx
│   └── ui/*
├── lib/
│   ├── medusa/client.ts
│   ├── medusa/server.ts
│   ├── medusa/queries.ts
│   ├── medusa/mutations.ts
│   ├── cart/cart-cookie.ts
│   ├── cart/cart-server-actions.ts
│   ├── checkout/checkout-schema.ts
│   ├── cdek/widget.ts
│   └── seo.ts
├── providers/
│   ├── query-provider.tsx
│   └── cart-provider.tsx
├── hooks/
│   ├── use-cart.ts
│   ├── use-reservation-countdown.ts
│   └── use-availability.ts
├── styles/globals.css
├── tests/e2e/
│   ├── cart-hold.spec.ts
│   ├── checkout.spec.ts
│   └── payment-webhook.spec.ts
├── next.config.ts
├── middleware.ts
├── package.json
└── tsconfig.json
```

### 1.3 Полная структура backend

```text
apps/backend/
├── src/
│   ├── api/
│   │   ├── store/wide-label/products/[id]/availability/route.ts
│   │   ├── store/wide-label/cart/hold/route.ts
│   │   ├── store/wide-label/waitlist/route.ts
│   │   ├── store/wide-label/checkout/shipping/route.ts
│   │   ├── store/wide-label/payments/yookassa/webhook/route.ts
│   │   ├── store/wide-label/shipping/cdek/rates/route.ts
│   │   └── store/wide-label/shipping/cdek/pvz/route.ts
│   ├── modules/wide-label/
│   │   ├── index.ts
│   │   ├── service.ts
│   │   ├── models/
│   │   │   ├── drop.ts
│   │   │   ├── reservation.ts
│   │   │   ├── waitlist-entry.ts
│   │   │   ├── order-snapshot.ts
│   │   │   ├── payment-attempt.ts
│   │   │   └── notification-delivery.ts
│   │   ├── repositories/
│   │   │   ├── reservation-repository.ts
│   │   │   └── waitlist-repository.ts
│   │   └── migrations/
│   │       └── 001_wide_label.sql
│   ├── workflows/
│   │   ├── reserve-variant.ts
│   │   ├── release-reservation.ts
│   │   ├── convert-reservation.ts
│   │   ├── create-order-snapshot.ts
│   │   ├── create-yookassa-payment.ts
│   │   ├── process-yookassa-webhook.ts
│   │   └── create-cdek-fulfillment.ts
│   ├── jobs/
│   │   ├── reservation-expiration.worker.ts
│   │   ├── reservation-sweeper.worker.ts
│   │   ├── waitlist-notification.worker.ts
│   │   └── cdek-status.worker.ts
│   ├── integrations/
│   │   ├── yookassa/client.ts
│   │   ├── cdek/client.ts
│   │   ├── s3/client.ts
│   │   ├── email/client.ts
│   │   └── telegram/client.ts
│   ├── subscribers/
│   │   ├── cart-line-removed.ts
│   │   ├── order-placed.ts
│   │   └── reservation-released.ts
│   ├── admin/
│   │   ├── product-fields.ts
│   │   └── drop-actions.ts
│   ├── config.ts
│   └── main.ts
├── test/
│   ├── reservation-race.integration.test.ts
│   ├── checkout.integration.test.ts
│   └── yookassa-webhook.test.ts
├── medusa-config.ts
├── package.json
└── tsconfig.json
```

### 1.4 Пакеты

`packages/types` содержит только DTO, enum и Zod schemas, не импортирует Medusa runtime. `packages/config` содержит shared eslint, prettier, tsconfig, Vitest и typed environment loaders. Интеграции YooKassa/CDEK не выносятся в отдельные пакеты до стабилизации API: на первом релизе они принадлежат backend и имеют узкие интерфейсы.

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

## 3. Workflows

### 3.1 Add to cart / Cart Hold

Endpoint: `POST /store/wide-label/cart/hold` with `{ cart_id, variant_id }`. The frontend never marks a product as held locally.

1. Validate cart token, variant id and request schema.
2. Acquire Redis lock `wl:variant:{variant_id}` with random token and 5-second TTL. Lock reduces contention but is not correctness mechanism.
3. Open PostgreSQL transaction with `READ COMMITTED`.
4. Read active reservations for variant and expire stale rows in the same transaction.
5. If an open reservation exists for another cart, rollback and return `409 ITEM_HELD`.
6. If the same cart already owns the reservation, return current `expires_at` without extending it.
7. Call Medusa inventory reservation workflow for quantity 1, or its equivalent inventory module operation.
8. Insert `wide_label_reservation` with `expires_at = now() + interval '15 minutes'`.
9. The partial unique index is the final race-condition guard. A unique violation maps to `409 ITEM_HELD`.
10. Commit transaction.
11. Enqueue BullMQ job `reservation.expire` with `jobId = reservation:{id}:expire` and delay until `expires_at`.
12. Release Redis lock in a `finally` block.
13. Return cart, reservation id, `reserved_until`, and server time.

On timeout/cancellation, the API returns no successful hold. The browser may retry once with the same cart and idempotency key.

Pseudocode:

```ts
await redisLock.withLock(`wl:variant:${variantId}`, 5000, async () => {
  const result = await db.transaction(async (tx) => {
    const now = await tx.now();
    await tx.query(`
      UPDATE wide_label_reservation
      SET status = 'expired', released_at = $1, updated_at = $1,
          release_reason = 'lazy_expiry'
      WHERE variant_id = $2
        AND status IN ('active','payment_pending')
        AND expires_at <= $1
    `, [now, variantId]);

    const existing = await tx.reservation.findOpenByVariant(variantId);
    if (existing && existing.cartId !== cartId) throw new ItemHeldError();
    if (existing) return existing;

    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    await inventory.reserve({ variantId, quantity: 1, tx });
    return tx.reservation.insert({
      variantId, cartId, status: 'active', reservedAt: now, expiresAt
    });
  });

  await expirationQueue.add('expire', { reservationId: result.id }, {
    jobId: `reservation:${result.id}:expire`,
    delay: Math.max(0, result.expiresAt.getTime() - Date.now()),
    removeOnComplete: 1000,
    removeOnFail: 5000
  });
  return result;
});
```

### 3.2 Release reservation

Release is idempotent. The worker starts a transaction, updates only rows still in `active/payment_pending` whose id matches, restores Medusa inventory reservation, emits `inventory.released` with a new `event_id`, and commits. If zero rows are updated, the job is already complete and exits successfully.

Cart line removal calls the same workflow with `release_reason = 'cart_line_removed'`. Manual admin release requires a reason and audit event.

Sweeper runs every minute:

```sql
UPDATE wide_label_reservation
SET status = CASE WHEN status = 'payment_pending' THEN 'expired' ELSE 'expired' END,
    released_at = now(),
    release_reason = COALESCE(release_reason, 'sweeper'),
    updated_at = now()
WHERE status IN ('active','payment_pending')
  AND expires_at <= now();
```

The application then reconciles inventory for each affected variant. Sweeper uses a batch size of 500 and repeats until fewer than 500 rows are returned.

### 3.3 Checkout: two steps

**Step 1, shipping and legal confirmation:**

- Validate cart and all open reservations.
- Re-read current Product, Variant, price, media and inventory in one server-side operation.
- Collect name, email, phone, shipping method, city, address or CDEK PVZ.
- For CDEK, calculate rate and save selected PVZ snapshot: code, name, city, address, coordinates, tariff and calculated price.
- Require consent to privacy policy and acknowledgement of measurements, condition and defects.
- Store consent text and version in checkout metadata, not only boolean.
- For `SELF_PICKUP`, allow `cash_on_delivery`; for all other methods reject it server-side.

**Step 2, payment:**

- Create/complete Medusa cart and order only after server validation.
- Extend `active` reservation once to `payment_pending`, with maximum additional 10 minutes and never beyond a configured hard limit.
- Generate `OrderSnapshot` in the same transaction as order finalization.
- Create `PaymentAttempt` with unique idempotency key.
- Create YooKassa payment with amount, currency, receipt data, confirmation redirect and metadata `{ order_id, attempt_id }`.
- Return confirmation URL or SBP QR payload.
- Set order/payment status to pending.

### 3.4 YooKassa cards/SBP and webhook

Use official YooKassa REST API. Do not make a third-party Medusa plugin a critical dependency. Payment provider interface:

```ts
interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPayment(providerPaymentId: string): Promise<ProviderPayment>;
  capturePayment(providerPaymentId: string): Promise<void>;
  cancelPayment(providerPaymentId: string): Promise<void>;
  refundPayment(providerPaymentId: string, amount: Money): Promise<void>;
}
```

Webhook endpoint accepts only YooKassa event types needed by the state machine. It verifies the event by fetching the payment from YooKassa using `object.id`; the request body is not trusted as final status. Processing:

1. Parse and validate payload.
2. Obtain provider payment id and order id from metadata.
3. Lock `payment:{provider_payment_id}` in Redis.
4. Fetch payment from YooKassa and map status.
5. Insert or update the matching `PaymentAttempt`; duplicate event is a no-op.
6. For `succeeded`, transactionally verify amount/currency/order, convert reservation, mark order paid, create fulfillment readiness event, and keep snapshot unchanged.
7. For `canceled`, release reservation and mark payment attempt canceled.
8. For unknown/transitional status, persist raw status and enqueue reconciliation.
9. Return HTTP 200 only after durable idempotent persistence. Provider retries are safe.

Never mark an order paid from the browser success page. A successful payment must also be checked against amount, currency, order and reservation ownership.

### 3.5 Order Snapshot

At order finalization read the product and all media from the same database transaction boundary. Copy fields, not references only. Copy image object keys and SHA-256 values. Store the exact consent text and version. The snapshot is written before payment confirmation and remains available for refunds, support and legal audit.

### 3.6 CDEK API v2

Implement `CdekClient` behind an interface:

```ts
interface ShippingProvider {
  calculateRate(input: RateInput): Promise<RateQuote[]>;
  listPickupPoints(input: PickupPointQuery): Promise<PickupPoint[]>;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
  cancelShipment(externalId: string): Promise<void>;
  getStatus(externalId: string): Promise<ShipmentStatus>;
}
```

Flow:

1. Browser opens official CDEK widget or backend PVZ endpoint.
2. Backend receives selected PVZ code and validates it against CDEK data.
3. Backend calculates rate using package dimensions/weight and destination.
4. Checkout stores a PVZ/address snapshot, not only a code.
5. After paid order, fulfillment workflow creates CDEK shipment with order idempotency key.
6. Persist CDEK order UUID, number, tariff, tracking number and request/response audit references.
7. Worker polls status or handles provider callback, mapping statuses to Medusa fulfillment statuses.
8. Cancellation is allowed only before handoff and is idempotent.

### 3.7 Waitlist notifications

For an `inventory.released` event, create one notification event id and unique delivery records. Select active entries ordered by `created_at`. MVP policy: notify the first 3 subscribers, then after 10 minutes notify the remaining active subscribers if the variant is still available. Every message says that availability is not guaranteed and reservation happens on add-to-cart.

Email and Telegram senders run in BullMQ, outside the release transaction. A delivery is sent only if status is `queued`; sender atomically changes it to `sent` with provider id. Retries use exponential backoff. A duplicate event cannot create duplicate delivery because `(event_id, waitlist_entry_id, channel)` is unique. Telegram requires prior bot interaction and stored `telegram_chat_id`; a username is not enough.

## 4. AI coding-agent roadmap

Each step is a separate Cursor/Claude Code prompt. Do not start the next step until the acceptance criteria pass.

### Step 1: setup and DB

- Create pnpm workspace and Turborepo with the directory tree above.
- Bootstrap Medusa backend and Next.js App Router storefront.
- Add shared TypeScript, ESLint, Prettier and environment validation.
- Add Docker PostgreSQL, Redis and MinIO.
- Implement WIDE LABEL Medusa module models and migration.
- Add Drop CRUD and product metadata contract.
- Add SQL partial unique index and integration test proving concurrent inserts yield one winner.
- Add S3 client with presigned upload and checksum metadata.

**Acceptance:** clean install; migrations run from empty database; health endpoints pass; two concurrent hold requests result in exactly one `201` and one `409`.

### Step 2: core Medusa workflows

- Implement `reserve-variant`, `release-reservation`, `convert-reservation` workflows.
- Add Redis lock with token-safe unlock.
- Add BullMQ expiration queue and repeatable sweeper.
- Add cart hold API, availability API and cart-line removal subscriber.
- Add exact state transition guards.
- Add structured logs with reservation id, variant id, cart id and correlation id.
- Add unit tests for idempotency, stale holds, same-cart retry, sold item and worker restart.

**Acceptance:** no double hold under 100 parallel requests; worker restart does not leave expired rows open; deleted cart line releases item.

### Step 3: frontend shell and cart

- Build RU storefront shell, catalog, drop page and product page.
- Implement product gallery with media kinds and defect disclosure.
- Implement server-side cart cookie containing opaque cart id only.
- Add add-to-cart action that calls hold endpoint and displays server `reserved_until`.
- Add countdown based on server time offset, not local absolute time.
- Add polling on focus and every 30 seconds.
- Add unavailable/held/waitlist states.
- Add Playwright race test with two browser contexts.

**Acceptance:** product page is SSR/SEO-safe; refresh retains cart; client cannot forge price or hold expiry; race test is deterministic.

### Step 4: checkout and YooKassa

- Implement Zod checkout schemas and two-step UI.
- Implement CDEK rate query contract but use a fake provider in local tests.
- Implement legal consent versioning.
- Implement OrderSnapshot creation.
- Implement YooKassa provider with idempotency keys, cards and SBP confirmation.
- Implement webhook fetch-and-verify flow and replay-safe event handling.
- Add payment timeout release and one-time payment_pending extension.
- Add refund/cancel service and admin audit logging.

**Acceptance:** duplicate webhook changes state once; paid order cannot be created without valid snapshot; amount/currency mismatch is rejected; redirect alone never marks paid.

### Step 5: CDEK and admin

- Implement CDEK OAuth/token cache and rate/PVZ/shipment clients.
- Add PVZ widget integration and address snapshot.
- Add fulfillment creation after paid event.
- Add tracking polling and admin retry action.
- Add Medusa Admin fields for brand, era, condition, measurements, defects, archival notes and drop.
- Add waitlist email first, then Telegram adapter.
- Add operational dashboards: active holds, expired holds, payment failures, webhook lag, CDEK failures.

**Acceptance:** one paid order creates one CDEK shipment; retry is idempotent; admin edits never mutate historical snapshot; waitlist delivery is duplicate-safe.

### Step 6: hardening before launch

- Run Testcontainers integration suite against PostgreSQL and Redis.
- Run Playwright checkout, payment replay and hold-race suite.
- Add rate limits to hold, waitlist, webhook and PVZ endpoints.
- Add Sentry and OpenTelemetry correlation.
- Add database backup/restore rehearsal.
- Add MinIO-to-production S3 migration checklist.
- Add privacy retention policy and webhook secret rotation runbook.
- Load test the 1-of-1 hot path before a drop.

## 5. Environment

### 5.1 Root `.env.example`

```dotenv
NODE_ENV=development
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:9000
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:3000

DATABASE_URL=postgres://wide_label:wide_label@localhost:5432/wide_label
REDIS_URL=redis://localhost:6379

JWT_SECRET=replace-with-32-plus-random-characters
COOKIE_SECRET=replace-with-32-plus-random-characters
CART_COOKIE_NAME=wl_cart_id
CART_HOLD_MINUTES=15
PAYMENT_PENDING_EXTRA_MINUTES=10
RESERVATION_SWEEPER_BATCH=500

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=wide-label-media
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=http://localhost:9000/wide-label-media

YOOKASSA_SHOP_ID=test_shop_id
YOOKASSA_SECRET_KEY=test_secret_key
YOOKASSA_WEBHOOK_SECRET=replace-with-webhook-secret
YOOKASSA_RETURN_URL=http://localhost:3000/checkout/success

CDEK_CLIENT_ID=test_client_id
CDEK_CLIENT_SECRET=test_client_secret
CDEK_API_URL=https://api.edu.cdek.ru/v2
CDEK_WIDGET_URL=https://widget.cdek.ru
CDEK_WEBHOOK_SECRET=replace-with-cdek-secret
CDEK_FROM_CITY_CODE=44
CDEK_FROM_POSTAL_CODE=000000
CDEK_FROM_ADDRESS=Replace before production
CDEK_PACKAGE_WEIGHT_GRAMS=1000
CDEK_PACKAGE_LENGTH_CM=30
CDEK_PACKAGE_WIDTH_CM=25
CDEK_PACKAGE_HEIGHT_CM=10

EMAIL_PROVIDER=console
EMAIL_FROM=hello@wide-label.example
EMAIL_API_KEY=replace-me
EMAIL_REPLY_TO=hello@wide-label.example

TELEGRAM_BOT_TOKEN=replace-me
TELEGRAM_BOT_USERNAME=wide_label_bot

NEXT_PUBLIC_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_CDEK_WIDGET_URL=https://widget.cdek.ru
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_DEFAULT_LOCALE=ru
```

Production values must be injected by secret manager. The shown MinIO and YooKassa values are local/test defaults only.

## 6. Docker Compose

Save as `infra/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: wide-label-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: wide_label
      POSTGRES_USER: wide_label
      POSTGRES_PASSWORD: wide_label
    ports:
      - "5432:5432"
    volumes:
      - wide_label_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wide_label -d wide_label"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:7-alpine
    container_name: wide-label-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - wide_label_redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 20

  minio:
    image: minio/minio:latest
    container_name: wide-label-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - wide_label_minio:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 20

  minio-init:
    image: minio/mc:latest
    container_name: wide-label-minio-init
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: /bin/sh
    command: -c "mc alias set local http://minio:9000 minioadmin minioadmin && mc mb --ignore-existing local/wide-label-media && mc anonymous set download local/wide-label-media"

volumes:
  wide_label_pg:
  wide_label_redis:
  wide_label_minio:
```

Run:

```bash
docker compose -f infra/docker-compose.yml up -d
pnpm install
pnpm --filter backend db:migrate
pnpm dev
```

## 7. API contract

```text
GET  /store/wide-label/products/:id/availability
POST /store/wide-label/cart/hold
POST /store/carts/:id/line-items
DELETE /store/carts/:id/line-items/:line_id
POST /store/wide-label/waitlist
POST /store/wide-label/checkout/shipping
POST /store/wide-label/checkout/payment
POST /store/wide-label/payments/yookassa/webhook
GET  /store/wide-label/shipping/cdek/rates
GET  /store/wide-label/shipping/cdek/pvz
POST /store/wide-label/admin/drops
```

Successful hold response:

```json
{
  "reservation_id": "res_01J...",
  "variant_id": "variant_01J...",
  "cart_id": "cart_01J...",
  "reserved_until": "2026-07-21T10:14:59.123Z",
  "server_time": "2026-07-21T09:59:59.123Z"
}
```

Error contract:

```json
{
  "code": "ITEM_HELD",
  "message": "Item is temporarily reserved by another customer.",
  "retryable": false
}
```

## 8. Observability and security

- Log every state transition as structured JSON; never log card data, full payment payloads or secrets.
- Use request correlation id through Next.js, Medusa, workers and provider calls.
- Rate-limit hold by IP/cart, waitlist by IP/contact, and webhook by provider signature/rate.
- Use constant-time comparison for webhook secrets and token-safe Redis unlock scripts.
- Store only required IP/user-agent data and define retention with legal counsel.
- S3 originals are private; storefront uses signed or CDN URLs. Public derivative URLs must not expose administrative object paths.
- PostgreSQL backups are encrypted and restore-tested.
- Admin actions that release, convert, refund or edit catalog state are audited.
- Payment secrets, CDEK credentials, Telegram token and S3 secret belong in a secret manager, not repository files.

## 9. Definition of Done

The first production release is ready only when all of the following are true:

1. Two concurrent shoppers cannot reserve the same variant.
2. Expired holds are released by both delayed job and sweeper.
3. Same-cart retries are idempotent and do not extend the timer.
4. Payment success is accepted only after verified provider status.
5. Duplicate webhooks are harmless.
6. Every paid order has an immutable product/measurement/media/consent snapshot.
7. CDEK shipment creation is idempotent and stores a destination snapshot.
8. Waitlist notifications are deduplicated per release event.
9. Production secrets are absent from Git and logs.
10. Restore, refund, cancellation and provider outage runbooks have been rehearsed.

## 10. Official references

- [Medusa Inventory](https://docs.medusajs.com/resources/commerce-modules/inventory)
- [Medusa Reservations Lifecycle](https://docs.medusajs.com/resources/commerce-modules/inventory/reservations-lifecycle)
- [Medusa createReservationsWorkflow](https://docs.medusajs.com/resources/references/medusa-workflows/createReservationsWorkflow)
- [YooKassa API](https://yookassa.ru/developers/api)
- [CDEK API v2](https://apidoc.cdek.ru/)
- [BullMQ Delayed Jobs](https://docs.bullmq.io/guide/jobs/delayed)

**Главный инженерный приоритет:** сначала доказать конкурентную покупку одной вещи, корректное освобождение резерва и правдивый Order Snapshot. Красивый storefront без этих трёх гарантий для WIDE LABEL бесполезен.
