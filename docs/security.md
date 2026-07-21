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

