# That's My Dawg — Data Model

> Schema reference. The source of truth is `prisma/schema.prisma`. Update both in the same session as any change, and 👤 confirm before applying a migration.

## Models

### Scene
The selectable artwork/products. Seeded (the draft's hardcoded `SHIRTS` array becomes seed rows).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| slug | String @unique | e.g. `bar-dog` |
| name | String | "Bar Dog" |
| description | String | Short blurb |
| priceCents | Int | Retail price (e.g. 3999) |
| shirtColor | String | Preselected color |
| badge | String? | "Best Seller" / "New Drop" / null |
| sceneImageUrl | String | Scene artwork (swap base) |
| active | Boolean @default(true) | Hidden when false |
| sortOrder | Int @default(0) | Grid order |
| createdAt | DateTime @default(now()) | |
| proofs | Proof[] | relation |
| orders | Order[] | relation |

### Proof
Result of one AI generation (the dog swapped into a scene).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| sceneId | String | FK → Scene |
| sessionId | String | Anonymous cookie session id |
| dogPhotoUrl | String | Uploaded photo (Supabase Storage) |
| proofImageUrl | String? | Generated proof; null until done |
| status | ProofStatus @default(pending) | pending / done / failed |
| model | String | fal model id used |
| createdAt | DateTime @default(now()) | |
| order | Order? | relation (POC: one proof → at most one order) |

### Order
A purchase. Created/confirmed via Stripe; fulfilled manually in Phase 1.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| sceneId | String | FK → Scene |
| proofId | String @unique | FK → Proof (the image to print) |
| size | String | From SIZES |
| quantity | Int @default(1) | 1 in POC |
| amountCents | Int | Charged amount (from server/DB, not client) |
| currency | String @default("usd") | |
| status | OrderStatus @default(pending) | pending / paid / fulfilled / cancelled |
| stripeSessionId | String? | Stripe Checkout Session id |
| stripePaymentIntent | String? | Set on payment |
| customerEmail | String? | Captured by Stripe |
| shippingName | String? | Captured by Stripe |
| shippingAddress | Json? | Captured by Stripe |
| printfulOrderId | String? | Operator-entered (Phase 1) / API-set (Phase 2) |
| fulfilledAt | DateTime? | Null until fulfilled |
| createdAt | DateTime @default(now()) | |

## Enums
- `ProofStatus`: `pending`, `done`, `failed`
- `OrderStatus`: `pending`, `paid`, `fulfilled`, `cancelled`

## Relationships
- Scene 1—* Proof, Scene 1—* Order
- Proof 1—1 Order (POC)
- All timestamps UTC.

## Notes
- Amount charged always derives from the Scene's `priceCents` server-side — never a client-supplied value.
- No card data is stored (Stripe handles it); only Stripe ids + the shipping/email Stripe returns.
