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

