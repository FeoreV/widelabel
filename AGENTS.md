# WIDE LABEL Agent Operating Rules

## First read
Read only: `AGENTS.md`, the current file in `tasks/`, and the referenced files in `docs/`. Do not read the full `handoff.md` during implementation.

## Workflow
One task = one focused PR. Before editing, list allowed files. After editing, run tests, lint, typecheck, inspect the diff, and stop. Never start the next task automatically.

## Scope
Do not refactor unrelated code or add speculative abstractions. Do not add dependencies without justification. Do not modify `handoff.md`. Never create `TODO`, `FIXME`, `stub`, placeholder handlers, fake success paths, or swallowed errors.

## Architecture invariants
PostgreSQL is the source of truth. Redis is only for locks, cache and queues. A variant has at most one open reservation with status `active` or `payment_pending`. Same-cart retries are idempotent and never extend expiry. Client price, inventory state and expiry are never trusted.

## Database
Never change schema without a new migration. Never edit an applied migration. Partial unique index for open reservations is mandatory. Test migrations against an empty PostgreSQL database.

## OrderSnapshot
`OrderSnapshot` is immutable after creation. No update endpoint, admin edit, cascade mutation or background rewrite may modify it. Build it only from server-side product data and persist measurements, defects, media checksums, price, currency and consent version.

## API and integrations
Treat `docs/api-contracts.md` as executable contract. Preserve field names, status codes and error codes. External providers require adapters and mocked contract tests. Redirect pages never prove payment success; verified provider status does.

## Completion report
Report changed files, commands run, test results, assumptions and unresolved risks. If an acceptance criterion cannot be proven, stop and say why instead of guessing.
