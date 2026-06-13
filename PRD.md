# That's My Dawg — Product Requirements Document

> **Claude context note:** This PRD is the source of truth for product decisions. Reference it before any architectural or product call. **POC scope only** — build only what is marked POC. When something is ambiguous and a reasonable default exists, make the call, note it inline, and proceed. Don't ask for clarification unless the gap would materially change the implementation.

---

## 1. Product Overview

**One-liner:** A streetwear store where a visitor uploads a photo of their dog, picks a pre-designed scene, and gets an instant AI-generated proof of their dog dropped into the artwork — then orders it as a printed oversized tee, drop-shipped to their door.

**The hook:** The product *is* personalization. Every shirt is the customer's actual dog, composited into a hand-designed streetwear scene (e.g. "Bar Dog", "The Therapist", "Desert Cowboy"). The proof is generated and shown **before** purchase, so the customer buys what they already saw.

**Problem it solves:** Custom pet merch today is either generic (slap a photo on a blank) or slow (email back-and-forth with a designer). This is instant, on-brand, and self-serve.

**Target user:** Dog owners who buy apparel and merch, value novelty and shareability, and are comfortable buying online. No account required.

**Business model:** Drop-shipping. No inventory. The customer pays retail; we pay the print-on-demand base cost + the per-generation AI cost; margin is the spread.

**Platform:** Responsive website (desktop + mobile web). No native app.

---

## 2. Goals & Non-Goals

### Goals (POC)
- Let a visitor go from landing page → chosen scene → uploaded dog → **proof** → paid order with minimal friction.
- Generate a believable, on-brand proof: the customer's dog embedded in the scene's art style (lighting, palette, painted look), not a flat overlay.
- Take real money via Stripe and persist the order.
- Keep fixed cost at ~$0 and per-visitor AI cost capped (cheap model + a free-proof cap).
- Validate proof quality, willingness to pay, and demand **before** building automated fulfillment.

### Non-Goals (POC — explicitly out)
- **Automated fulfillment.** Phase 1 fulfills orders manually (see §11). Stripe → Printful automation is Phase 2.
- **High-resolution print regeneration.** Phase 1 uses one cheap generation; the print-quality upscale/regen pass is Phase 2.
- **User accounts / login.** Guest checkout only. No saved orders, no order history portal.
- **A scene admin CMS.** Scenes are seeded via the database / a seed script; a self-serve scene builder is post-POC.
- **Cart with multiple items.** One scene + one dog + one size per checkout in POC.
- **Reviews/testimonials backend.** The draft's testimonials are static copy in POC.
- **Email sending.** Order confirmation emails are console-logged in POC (`// TODO: POST-POC`), Stripe sends its own receipt.
- **Internationalization, multi-currency.** USD, English only.
- **Analytics / crash SDKs** (PostHog, Sentry).
- **Native mobile app, Android, iPad-specific work.**

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) | Full-stack — UI + server-side API route handlers in one app |
| Hosting | Vercel | `main` → production, PRs → preview deploys |
| Database | PostgreSQL (Supabase free tier) | Accessed via Prisma ORM |
| Image storage | Supabase Storage | Dog uploads + generated proofs; signed URLs |
| AI generation | fal.ai | Model: **Gemini 2.5 Flash Image edit** (~$0.039/image) for the dog swap |
| Payments | Stripe Checkout | Hosted checkout; webhook for payment confirmation |
| Fulfillment | Printful | Manual order placement in Phase 1; API automation in Phase 2 |
| Styling | Tailwind CSS mapped to design tokens | Tokens defined in `DESIGN.md` |
| Issue tracking | GitHub Issues + Projects | No Linear; `TASKS.md` mirrors the backlog |
| Library docs | Context7 (MCP) | Fetch current docs before using any library |

**API routes:** all server endpoints live under `/api/*` (Next.js route handlers). See `/docs`.

**Secrets policy:** `FAL_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRINTFUL_API_KEY`, and the Supabase service-role key are server-only env vars. The browser never holds them. The original draft's "paste your fal key in the browser" flow is removed.

**Post-POC additions (do not build now):** automated Printful order creation, high-res print regeneration (Nano Banana Pro), accounts, scene CMS, cart, email SDK (Resend), rate-limit store (Redis/Upstash), observability.

---

## 4. Core Features (POC)

> Each feature maps to a screen or route. Used to scope each work session.

### Feature 1: Scene Gallery (landing + grid)
**What it does:** The storefront lands on a bold streetwear hero, then a grid of selectable scenes. Each scene card shows the artwork, name, short description, price, preselected shirt color, and an optional badge ("Best Seller", "New Drop").
**Source of data:** `Scene` records from the database (seeded). The draft's hardcoded `SHIRTS` array becomes seed data.
**Outputs:** Click a scene → opens the proof/order flow for that scene.
**Edge cases:**
- No scenes active: friendly empty state, not a blank grid.
- Scene image fails to load: placeholder + name, never a broken-image icon.

### Feature 2: Dog Photo Upload
**What it does:** In the order flow, the visitor uploads a photo of their dog. Validate type and size client-side and server-side; show a preview.
**Inputs:** One image file (`image/jpeg`, `image/png`, `image/webp`), max size from `constants.ts` (`MAX_UPLOAD_MB`).
**Outputs:** File stored in Supabase Storage under a per-session path; URL passed to generation.
**Edge cases:**
- Wrong file type / oversized: inline error explaining the limit and what to do.
- Upload fails: retry UI, never a silent drop.
- No face/dog detectable: out of POC scope to verify — we generate regardless and let the customer judge the proof.

### Feature 3: AI Proof Generation (the dog swap)
**What it does:** Server calls fal.ai (Gemini 2.5 Flash Image edit) with the scene artwork + the dog photo + a per-scene tuned instruction, and returns a composited proof where the dog is embedded in the scene's style.
**Inputs:** `sceneId`, dog photo URL, session id.
**Outputs:** Proof image stored in Supabase Storage; `Proof`/`GenerationJob` row; proof shown in the flow.
**Cost & abuse control:**
- Cheap model only in POC (~$0.039/proof).
- Free-proof cap per session (`MAX_FREE_PROOFS_PER_SESSION` in `constants.ts`).
- Per-IP/session rate limiting on `/api/generate`.
**Edge cases:**
- Generation fails or times out: clear retry; do not charge, do not advance to checkout.
- Cap reached: explain it and prompt to order one of the proofs already generated.
- Slow generation: show a designed loading state (the draft already has spinner + status copy).

### Feature 4: Size Selection + Order Summary
**What it does:** With a proof shown, the visitor picks a size (shirt color is fixed per scene), sees the price, and proceeds to checkout. One scene + one dog + one size per order in POC.
**Inputs:** Selected size from `SIZES` (`constants.ts`), the chosen `Proof`.
**Outputs:** A pending `Order` (or a Stripe Checkout Session created on "Order").
**Edge cases:**
- No size selected: checkout disabled until valid.
- Proof expired/missing: re-prompt to generate.

### Feature 5: Stripe Checkout + Order Persistence
**What it does:** Server creates a Stripe Checkout Session for the chosen scene/size/price; the customer pays on Stripe's hosted page and returns to a success screen. A Stripe webhook confirms payment and marks the order paid, capturing the shipping address Stripe collected.
**Inputs:** Pending order details; Stripe collects email + shipping address.
**Outputs:** `Order` marked `paid`; proof + shipping captured for manual fulfillment.
**Edge cases:**
- Payment cancelled: return to the flow with the proof intact; no order created.
- Webhook signature invalid: reject (security requirement — see security doc).
- Duplicate webhook delivery: idempotent — never double-create or double-fulfill.

### Feature 6: Admin Fulfillment View (manual, Phase 1)
**What it does:** A minimal protected `/admin` page lists paid orders with the proof image, size, shipping address, and a status the operator can flip (`paid` → `fulfilled`). The operator places the Printful order by hand and pastes back the Printful order id / tracking.
**Auth:** Simple shared-secret/basic auth from env (`ADMIN_PASSWORD`) — not a real account system.
**Outputs:** Order status + Printful reference updated.
**Edge cases:**
- Wrong password: deny, no detail leak.
- This is the seam Phase 2 replaces with automation.

---

## 5. User Flow (primary, happy path)

1. Land on hero → scroll/See the scene grid.
2. Tap a scene → order flow opens (modal or route) for that scene.
3. Upload a dog photo → preview.
4. Generate → proof appears (dog embedded in the scene).
5. (Optionally regenerate, within the free cap.)
6. Pick a size → see price.
7. Order → Stripe Checkout (email + shipping collected by Stripe) → pay.
8. Return to success screen ("Your proof is locked in, printing soon").
9. **Behind the scenes:** webhook marks order paid → appears in `/admin` → operator places the Printful order manually.

**Dead ends to design for:** generation failure (retry), payment cancel (proof preserved), free cap reached (order what you have), upload failure (retry). No blank screens anywhere.

---

## 6. Navigation / Route Structure

```
/                         Storefront — hero, ticker, scene grid, how-it-works, FAQ, footer
  └── order flow          Modal or /design/[slug] — upload → generate → size → checkout
/checkout/success         Post-payment success screen (Stripe return_url)
/checkout/cancel          Payment cancelled — returns to the scene with proof intact
/admin                    Protected manual fulfillment list (Phase 1)

/api/health               Server health check
/api/scenes               List active scenes
/api/generate             Run the dog swap (rate-limited, capped)
/api/checkout             Create a Stripe Checkout Session
/api/webhooks/stripe      Stripe payment webhook
/api/orders               Admin: list/update orders
```

---

## 7. Data Models (POC)

> Full schema in `docs/data-model.md` / `prisma/schema.prisma`.

### Scene
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| slug | String (unique) | e.g. `bar-dog` |
| name | String | "Bar Dog" |
| description | String | Short streetwear blurb |
| priceCents | Int | Retail price in cents (e.g. 3999) |
| shirtColor | String | Preselected color ("Black", "Khaki", "White") |
| badge | String? | "Best Seller" / "New Drop" / null |
| sceneImageUrl | String | Scene artwork used as the swap base |
| active | Boolean | Hidden when false |
| sortOrder | Int | Grid ordering |
| createdAt | DateTime | Auto |

### Proof (generation result)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| sceneId | String | FK → Scene |
| sessionId | String | Anonymous session/cookie id |
| dogPhotoUrl | String | Uploaded photo (Supabase Storage) |
| proofImageUrl | String? | Generated proof; null until done |
| status | Enum | `pending` / `done` / `failed` |
| model | String | fal model id used |
| createdAt | DateTime | Auto |

### Order
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| sceneId | String | FK → Scene |
| proofId | String | FK → Proof (the image to print) |
| size | String | From `SIZES` |
| quantity | Int | 1 in POC |
| amountCents | Int | Charged amount |
| currency | String | `usd` |
| status | Enum | `pending` / `paid` / `fulfilled` / `cancelled` |
| stripeSessionId | String? | Stripe Checkout Session id |
| stripePaymentIntent | String? | Set on payment |
| customerEmail | String? | Captured by Stripe |
| shippingName | String? | Captured by Stripe |
| shippingAddress | Json? | Captured by Stripe |
| printfulOrderId | String? | Pasted by operator (Phase 1) / set by API (Phase 2) |
| fulfilledAt | DateTime? | Null until fulfilled |
| createdAt | DateTime | Auto |

**Relationships:** Scene → many Proofs, Scene → many Orders, Proof → one Order (POC). All timestamps UTC.

---

## 8. Pricing & Limits (`src/constants.ts`)

Business numbers live in `constants.ts`, never hardcoded inline.

| Constant | POC value | Purpose |
|---|---|---|
| `DEFAULT_PRICE_CENTS` | 3999 | Default scene price ($39.99) — per-scene override in DB |
| `SIZES` | `["S","M","L","XL","2XL","3XL"]` | Oversized tee size run |
| `MAX_UPLOAD_MB` | 10 | Max dog photo size |
| `ALLOWED_IMAGE_TYPES` | jpeg/png/webp | Accepted upload types |
| `MAX_FREE_PROOFS_PER_SESSION` | 3 | Free generations before requiring an order |
| `GENERATE_RATE_PER_MIN` | 6 | Per-IP `/api/generate` rate limit |
| `FAL_MODEL_ID` | Gemini 2.5 Flash Image edit | The swap model (POC) |

---

## 9. AI Generation Notes

- **One provider (fal.ai), one secret key, server-side.** The browser calls `/api/generate`; the route holds `FAL_KEY`.
- **POC model:** Gemini 2.5 Flash Image edit (~$0.039/image) — strong at multi-image instruction-based compositing (scene + dog), cheap enough for free proofs.
- **Per-scene instruction:** each `Scene` swap uses a tuned prompt describing how the dog should sit in that scene's style. For POC these are hardcoded per scene (no live Claude prompt-builder call), keeping cost to one model call per proof.
- **Print resolution (Phase 2):** the cheap proof is screen-resolution. A higher-res regeneration (e.g. Nano Banana Pro, ~$0.15, 2K/4K) runs only at fulfillment, so we pay for print quality only on real orders.

---

## 10. Error Handling Standards

Apply globally; don't wait to be asked per-feature.
- **Generation errors:** retry UI; never charge or advance on failure.
- **Upload errors:** inline, specific ("Use a JPG/PNG/WEBP under 10MB"); retry.
- **Payment errors / cancel:** preserve the proof; return cleanly.
- **Webhook errors:** verify signature; reject invalid; idempotent on retries.
- **Empty states:** every grid/list/flow step that can be empty has a designed state. No blank screens.
- **Loading states:** designed spinner/status on anything over ~300ms (generation especially).

---

## 11. Phasing

**Phase 1 (first ship — POC):** Scene gallery → upload → proof (cheap model, capped) → Stripe Checkout → order persisted → **manual** Printful fulfillment via `/admin`. Validates proof quality, payment, and demand.

**Phase 2 (deferred):** Stripe webhook → high-res print regeneration → Printful order created via API → tracking returned to customer. Plus: scene CMS, accounts, cart, email SDK, rate-limit store.

---

## 12. Manual Setup Prerequisites (👤 You)

> Claude cannot do these. Detail in `HOW_TO_WORK_WITH_CLAUDE.md` §0.

| # | Task |
|---|---|
| 1 | Create the GitHub repo, push the scaffold, connect GitHub MCP in Claude settings |
| 2 | Create a Vercel project linked to the repo |
| 3 | Create a Supabase project; copy `DATABASE_URL` / `DIRECT_URL`; create a Storage bucket; copy the service-role key |
| 4 | Create a fal.ai account; copy `FAL_KEY` |
| 5 | Create a Stripe account; copy test secret + publishable keys; set up the webhook signing secret |
| 6 | Create a Printful account (used manually in Phase 1; API key needed for Phase 2) |
| 7 | Set all env vars locally (`.env.local`) and in Vercel |

---

## 13. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Final retail price per scene — is a flat $39.99 right once Printful base cost + AI cost are known? | You | Open |
| 2 | Free-proof cap — is 3 per session the right balance of delight vs. cost? | You | Open |
| 3 | Dog photo retention — how long do we keep uploads and proofs after an order (or no order)? Set in security doc. | You | Open |
| 4 | Which Printful blank is the oversized streetwear tee, and which colors per scene? | You | Open |

---

## 14. Out of Scope (Global)

Do not implement during POC even if they feel like natural extensions:
- Automated Printful order creation; high-res print regen
- Accounts / login / order history portal
- Scene admin CMS / self-serve scene builder
- Multi-item cart; multi-quantity beyond 1
- Email sending SDK (Resend); SMS
- Redis/Upstash rate-limit store (in-memory/simple is fine for POC)
- Sentry / PostHog / analytics
- i18n / multi-currency
- Native app / Android

---

*Last updated: foundation draft | That's My Dawg | POC*
