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

