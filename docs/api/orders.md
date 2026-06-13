# /api/orders (admin — Phase 1 manual fulfillment)

Gated by the `ADMIN_PASSWORD` env secret (POC — not a real account system). Used by the `/admin` page.

## GET /api/orders
Lists orders for the operator (default: `paid`, not yet fulfilled), newest first.

**Response** `200 OK`
```json
{
  "orders": [
    {
      "id": "clx...",
      "status": "paid",
      "size": "L",
      "amountCents": 3999,
      "sceneName": "Bar Dog",
      "shirtColor": "Black",
      "proofImageUrl": "https://.../signed...",
      "customerEmail": "buyer@example.com",
      "shippingName": "...",
      "shippingAddress": { "line1": "...", "city": "...", "state": "...", "postal_code": "...", "country": "US" },
      "createdAt": "2026-06-13T...Z"
    }
  ]
}
```

## PATCH /api/orders/:id
Updates an order during manual fulfillment.

**Request**
```json
{ "status": "fulfilled", "printfulOrderId": "PF-12345" }
```

**Response** `200 OK` `{ "order": { ... } }`

**Errors**: `UNAUTHORIZED` (401), `ORDER_NOT_FOUND` (404), `VALIDATION_ERROR` (422).

**Notes**
- This endpoint pair is the seam Phase 2 replaces with automated Printful order creation.
