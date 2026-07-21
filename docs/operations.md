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

