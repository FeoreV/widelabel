# WIDE LABEL

1-of-1 concept store built on Medusa v2 + Next.js 16.

---

## Quick start (local dev)

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure (Postgres, Redis, MinIO)
docker compose -f infra/docker-compose.yml up -d postgres redis minio minio-init

# 3. Copy env and fill in secrets
cp .env.example .env

# 4. Run migrations
pnpm --filter @wide-label/backend db:migrate

# 5. Start dev servers
pnpm dev
```

---

## Docker production stack

The full stack (Postgres, Redis, MinIO, backend, storefront) runs via Docker Compose:

```bash
# 1. Create the Docker env file from the template and fill in real secrets
cp .env.docker.example .env.docker
#    → Set JWT_SECRET, COOKIE_SECRET, YOOKASSA_*, CDEK_*, TELEGRAM_*, etc.

# 2. Validate compose config
docker compose -f infra/docker-compose.yml config

# 3. Build images
docker compose -f infra/docker-compose.yml build

# 4. Start all services
docker compose -f infra/docker-compose.yml up -d

# 5. Check health
docker compose -f infra/docker-compose.yml ps
curl http://localhost:9000/health    # backend
curl http://localhost:3000/api/health  # storefront
```

### Environment files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | ✅ Yes | Full variable reference with safe defaults |
| `.env.docker.example` | ✅ Yes | Docker-specific template (secrets must be filled) |
| `.env` | ❌ No | Local dev secrets (git-ignored) |
| `.env.docker` | ❌ No | Docker runtime secrets (git-ignored) |

### Secrets policy

- `JWT_SECRET` and `COOKIE_SECRET` have **no fallback in production**.
  The backend process exits immediately with a clear error if they are absent when `NODE_ENV=production`.
- All other secrets (YooKassa, CDEK, Telegram, S3) must be injected via `.env.docker` or a secret manager.

---

## Migrations

Custom SQL migrations live in `apps/backend/src/migrations/`:

| File | Tables created |
|------|---------------|
| `001_extensions_enums_drops_reservations.sql` | ENUMs, `wide_label_drop`, `wide_label_drop_product`, `wide_label_reservation` |
| `002_waitlist_notification_delivery.sql` | `wide_label_waitlist_entry`, `wide_label_notification_delivery` |
| `003_order_snapshot.sql` | `wl_order_snapshot` |
| `004_payment_attempt.sql` | `wl_payment_attempt` |
| `005_waitlist.sql` | Extended waitlist constraints |

Medusa core tables are managed by `medusa db:migrate`. Custom migrations are applied separately.

---

## CI checks

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
turbo run test --force   # cold run, no cache
```

---

## Agent workflow

Tasks are in `tasks/`. Read `AGENTS.md` first.
One task = one focused PR. Status tracked in `tasks/STATUS.md`.
