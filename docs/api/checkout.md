# /api/checkout  +  /api/webhooks/stripe

## POST /api/checkout
Creates a Stripe Checkout Session for a chosen proof + size and returns the redirect URL. Server-side — holds `STRIPE_SECRET_KEY`. The amount comes from the scene's DB price, never the client.

**Request** `application/json`
```json
{ "proofId": "clx...", "size": "L" }
```

**Flow**
1. Validate `proofId` exists and `size` ∈ `SIZES`.
2. Look up the scene price (`priceCents`) from the DB.
3. Create a `pending` Order + a Stripe Checkout Session (collect email + shipping), with `success_url`/`cancel_url`.

**Response** `200 OK`
```json
{ "checkoutUrl": "https://checkout.stripe.com/...", "orderId": "clx..." }
```

**Errors**: `VALIDATION_ERROR` (422), `PROOF_NOT_FOUND` (404), `CHECKOUT_FAILED` (502).

---

## POST /api/webhooks/stripe
Receives Stripe payment events. **Verifies the signature with `STRIPE_WEBHOOK_SECRET`** and is **idempotent**.

**Flow**
1. Verify signature; reject (`400`) if invalid.
2. On `checkout.session.completed`: mark the Order `paid`, store `stripePaymentIntent`, capture `customerEmail` + shipping. No-op if already processed.
3. Console-log an order notification (`// TODO: POST-POC` — Stripe sends its own receipt). Phase 2: trigger high-res regen + Printful order.

**Response** `200 OK` `{ "received": true }`

**Notes**
- An unverified body is never trusted to mark an order paid.
- Duplicate deliveries must not double-fulfill.
