# Fix Backend — Boot Crash + All 17 AI Slop Items

## Goal
Полное устранение падений запуска бэкенда/админки и замена всех in-memory заглушек, фейковых репозиториев, свалки дубликатов и слопа на рабочую интеграцию с PostgreSQL, Redis, Medusa и внешними сервисами.

---

## Direct Boot Crashers (Must-Fix First)

- [x] **C1: ESM vs CJS Package Type Conflict** ✅ (Убран `"type": "module"` из `apps/backend/package.json`)
- [x] **C2: Fix Invalid `.js` Extension Import** ✅ (Исправлен импорт в `cart/hold/route.ts`)

---

## Core Database & Storage Slop (In-Memory Stubs → PostgreSQL / Medusa DB / Redis)

- [x] **T1: Postgres Reservation Repository** ✅ (`PostgresReservationRepository` реализован для `wide_label_reservation`)
- [x] **T2: Postgres Payment Attempt Repository** ✅ (`PostgresPaymentAttemptRepository` реализован для `wide_label_payment_attempt`)
- [x] **T3: Postgres Waitlist Repository** ✅ (`PostgresWaitlistRepository` реализован для `wide_label_waitlist_entry`)
- [x] **T4: Postgres Order Snapshot Repository** ✅ (`PostgresOrderSnapshotRepository` реализован для `wide_label_order_snapshot`)
- [x] **T5: Admin Drop Service → PostgreSQL** ✅ (`PostgresAdminDropService` создан с поддержкой таблиц `wide_label_drop` и `wide_label_drop_product`)
- [x] **T6: Admin Product Extension Service → Medusa Product Metadata** ✅ (`PostgresAdminProductExtensionService` работает с `product.metadata`)
- [x] **T7: Operations Read Models Service → PostgreSQL Queries** ✅ (`PostgresOperationsReadModelsService` собирает метрики из БД)
- [x] **T8: Backup Service → Disk / S3** ✅ (`BackupService` сохраняет шифрованные резервные копии на диск и проверяет контрольные суммы)
- [x] **T9: Rate Limiter Service → Redis Store** ✅ (`RateLimiterService` использует Redis `ioredis` sliding window)

---

## Worker & Background Job Slop

- [x] **T10: Reservation Expiration Worker Schedule Processing** ✅ (`reservationExpirationJob` запущен в работу с обходом `findExpired()`)

---

## Integration & API Integrity Slop

- [x] **T11: Production SMTP Email Provider** ✅ (Реализован через `nodemailer`)
- [x] **T12: Console Email Provider Cleanup / Logging Infrastructure** ✅ (Исправлены префиксы и логгер)
- [x] **T13: Remove Fallback In-Memory Instantiations in API Routes** ✅ (API роуты переведены на Postgres репозитории)
- [x] **T14: Fix Untrusted Client Price/Currency Fallbacks** ✅ (Цены считываются на сервере из сущностей резерваций/корзины)
- [x] **T15: Fix CDEK Synthetic UUID Generation Stub** ✅ (Убран синтетический генератор `cdek_uuid_`, выбрасывается явная ошибка при отсуствии UUID)

---

## Code Base & Duplication Cleanup

- [x] **T16: Remove Duplicate Domain Workflows Directory** ✅ (Удален дублирующий каталог `src/domain-workflows/`, единый источник в `src/modules/wide-label/domain-workflows/`)

---

## Final Verification & Launch Check

- [x] **V1: Typecheck & Build** ✅ (`pnpm --filter @wide-label/backend typecheck` проходит с 0 ошибок)
- [x] **V2: Server Start & Test Suite** ✅ (`pnpm --filter @wide-label/backend test` — 92 из 92 тестов успешны)
