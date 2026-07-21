# Wide Label — Production Runbooks

## 1. Secret Rotation

### When to rotate
- Credential suspected compromise
- Scheduled quarterly rotation (YooKassa, CDEK, S3, Telegram)
- Staff offboarding

### Procedure

```bash
# 1. Generate new secret
openssl rand -hex 32

# 2. Update environment variable in production secrets manager WITHOUT removing old value yet
# Add NEW_YOOKASSA_API_KEY alongside old YOOKASSA_API_KEY

# 3. Deploy adapter change that tries new key first, falls back to old
# For YooKassa: update YOOKASSA_SHOP_ID + YOOKASSA_SECRET_KEY in vault

# 4. Verify new key works end-to-end in production (test small payment capture)

# 5. Remove old key from secrets manager

# 6. Verify no errors in observability (check Sentry for PAYMENT_DECLINED spikes)
```

**Critical invariants:**
- Never rotate `BACKUP_ENCRYPTION_KEY` without first creating a backup with the old key and re-encrypting with the new key
- Never rotate Redis auth token without coordinating with lock service — in-flight locks will fail

---

## 2. Provider Outage (YooKassa / CDEK)

### Detection
- Sentry: `PAYMENT_DECLINED` or `CDEK_API_ERROR` spike > 5 errors/min
- Operations endpoint: payment_failures count rising
- Webhook lag metrics: avg_lag_ms > 30,000

### Response

**YooKassa outage:**
1. Check https://yookassa.ru/developers (status page)
2. Reservations remain in `payment_pending` — they will NOT auto-expire during outage window (expiry is only for `active` holds)
3. Disable YooKassa redirect button in storefront via feature flag `PAYMENT_DISABLED=true`
4. When restored: verify webhook queue is processed — all pending webhooks must be replayed
5. Do NOT manually mark reservations `converted` without verified provider status

**CDEK outage:**
1. Check https://www.cdek.ru/ru/status
2. Fulfilled orders remain in `created` CDEK status — sweeper will retry
3. Pause fulfillment job: `CDEK_FULFILLMENT_PAUSED=true`
4. When restored: resume job, verify all orders that failed to create are retried

---

## 3. Refund Procedure

### Preconditions
- `OrderSnapshot` exists and is immutable — read it to verify amounts
- `PaymentAttempt` status is `captured`

### Steps

```bash
# 1. Locate payment attempt by order id
# SELECT * FROM payment_attempts WHERE reservation_id = '<res_id>';

# 2. Call YooKassa refund API (via YooKassaClient.refundPayment)
# Refund amount MUST equal captured amount from OrderSnapshot — never trust client input

# 3. Update payment_attempt status to 'refunded'
# UPDATE payment_attempts SET status = 'refunded' WHERE id = '<attempt_id>';

# 4. Mark reservation 'released'
# Only valid transition: converted → released

# 5. Send email notification to customer via EmailNotificationService
```

**Never:**
- Partially refund without explicit customer request and business approval
- Modify `OrderSnapshot` — it is strictly immutable

---

## 4. Reservation Release (Manual)

### When
- Customer request before payment capture
- Admin cancellation
- Payment declined and reservation stuck

### Steps

```bash
# 1. Verify reservation status (active or payment_pending only)
# SELECT * FROM reservations WHERE id = '<res_id>';

# 2. Transition to 'released' via state machine — never update status directly
# transitionReservationStatus(reservation, 'released')

# 3. Confirm variant availability restored
# GET /api/availability/<variant_id>  → {"status": "available"}
```

---

## 5. S3 Media Migration

### Scenario: Moving to a different S3 bucket or provider

```bash
# 1. Set up new bucket with same IAM policy structure

# 2. Sync objects (never delete source until verified):
aws s3 sync s3://old-bucket/wide-label/ s3://new-bucket/wide-label/ --no-delete

# 3. Update S3_BUCKET_NAME env var to new bucket (blue-green deploy)

# 4. Verify all product images resolve (spot-check 10 products)

# 5. Update OrderSnapshot media checksums reference if bucket URL changed:
# NOTE: OrderSnapshot is immutable — only update the CDN base URL env var,
# do NOT modify any OrderSnapshot records

# 6. Delete old bucket objects ONLY after 30-day retention window
```

**Critical:** OrderSnapshot media_checksums are hashes of content, not URLs. Migration does not break immutability.
