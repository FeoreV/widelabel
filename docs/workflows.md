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

