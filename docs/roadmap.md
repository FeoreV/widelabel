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

