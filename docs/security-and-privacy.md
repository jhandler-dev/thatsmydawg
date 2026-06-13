# That's My Dawg — Security & Privacy Standard

> Living reference for how the app handles security and user data.
> Read alongside `PRD.md` (what to build), `CLAUDE.md` (how to build it), and `DESIGN.md` (how it looks).
> **Update this file in the same session as any change affecting data handling, secrets, uploads, payments, or third-party access.**
>
> Status: **POC.** Some hardening is intentionally deferred (§9). This document states what is *actually enforced today*, not aspirations.

---

## 1. Purpose & Scope

That's My Dawg is a Next.js storefront with server-side API route handlers. Visitors upload a photo of their dog, an AI model composites it into a scene, and they pay (Stripe) for a printed tee that is fulfilled via Printful.

**Threat model (POC):** the realistic risks we design against are (a) leaking a server-side secret key (fal, Stripe, Printful, Supabase) to the browser, (b) abuse of the paid AI-generation endpoint (cost-draining), (c) forged or replayed payment webhooks, (d) mishandling of user-uploaded photos and shipping/contact PII, and (e) basic web hygiene (input validation, oversized uploads). Card data is **never** handled by us — Stripe does. Full at-rest encryption, accounts, and advanced abuse defense are **out of POC scope** (§9).

---

## 2. Data Inventory

| Data | Where stored | Sensitivity | Notes |
|---|---|---|---|
| Uploaded dog photo | Supabase Storage | **User content** | Per-session path; used only to generate the proof; retention policy in §7 |
| Generated proof image | Supabase Storage | User content | The image the customer buys and we print |
| Session id | Cookie (anonymous) | Low | Ties uploads/proofs/orders to a browser session; no login |
| Customer email | Postgres (`Order`) | **PII** | Collected by Stripe at checkout; used for fulfillment/notification |
| Shipping name + address | Postgres (`Order`) | **PII** | Collected by Stripe; needed to ship the order |
| Payment card details | **Never stored by us** | **Critical** | Handled entirely by Stripe Checkout (hosted). We store only Stripe's session/payment-intent ids |
| `FAL_KEY` | Server env var only | **Critical** | Never in client code or `NEXT_PUBLIC_*` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Server env var only | **Critical** | Server-side checkout + webhook verification |
| `PRINTFUL_API_KEY` | Server env var only | **High** | Phase 2 automation; manual use in Phase 1 |
| Supabase service-role key | Server env var only | **Critical** | Server-side storage/db; never shipped to the browser |
| `ADMIN_PASSWORD` | Server env var only | **High** | Gates the `/admin` fulfillment view (POC) |

There is **no** account system and no card data on our servers.

---

## 3. Secrets — the #1 rule

**Every secret listed in §2 lives only in server-side environment variables and is used only inside `/api` route handlers or `lib/*` modules.**

- 🚫 No secret in a Client Component, in a `NEXT_PUBLIC_*` variable, or in any bundle shipped to the browser.
- The website draft's original flow — pasting a fal API key into the browser and storing it in `localStorage` — is **removed and must never return**. The browser calls `/api/generate`; the route holds `FAL_KEY`.
- `.env*` is git-ignored; `.env.example` carries placeholders only. Secrets are set in `.env.local` (dev) and the Vercel dashboard (preview/prod), never committed.

---

## 4. AI Generation Endpoint (`/api/generate`)

This is the one endpoint that costs money per call, so it is the main abuse surface.

- **Server-side only.** The key never leaves the server; the browser only sends `sceneId` + the uploaded photo reference.
- **Rate limiting.** Per-IP/session cap (`GENERATE_RATE_PER_MIN` from `constants.ts`). POC uses a simple in-memory/simple limiter; a shared store (Redis/Upstash) is 🔮 Phase 2.
- **Free-proof cap.** `MAX_FREE_PROOFS_PER_SESSION` limits generations before an order is required; the cap is enforced server-side, not just in the UI.
- **Input validation.** Validate `sceneId` exists/active; validate the uploaded file's type and size **server-side** (not just client-side) before calling fal.
- **Cheap model in POC.** Gemini 2.5 Flash Image edit keeps per-call cost low; the higher-res print regeneration is gated behind a paid order (🔮 Phase 2).

---

## 5. Uploads (dog photos)

- **Validate twice:** client-side for UX, **server-side** for safety — allowed MIME types (`ALLOWED_IMAGE_TYPES`) and max size (`MAX_UPLOAD_MB`) from `constants.ts`. Reject anything else with a clear error.
- **Store under a per-session path** in Supabase Storage; do not make the bucket publicly listable.
- **Serve via signed URLs** with a limited lifetime rather than permanent public URLs where feasible.
- Never trust the client-provided filename or content-type alone; check the actual bytes/type server-side.

---

## 6. Payments (Stripe)

- **We never touch card data.** Checkout happens on Stripe's hosted page; we create the session server-side and redirect.
- **Webhook signature verification is mandatory.** The `/api/webhooks/stripe` handler verifies every event with `STRIPE_WEBHOOK_SECRET` and rejects anything that fails. An unverified body is never trusted to mark an order paid.
- **Idempotency.** Webhook delivery can repeat — marking an order paid (and, in Phase 2, creating a Printful order) must be idempotent. Never double-fulfill.
- **Amount integrity.** The charged amount comes from the server (scene price from the DB), never from a client-supplied price.

---

## 7. Privacy Posture

- **Data minimization.** We collect only what's needed: the dog photo, the proof, and (via Stripe) the email + shipping for an order. No accounts, no passwords, no tracking SDKs in POC.
- **Contact/shipping isolation.** PII is stored server-side and shown only in the protected `/admin` view to fulfill orders. It is never exposed to other visitors or in client bundles.
- **Retention (set the policy):** uploads and proofs that never result in an order should be deleted after a defined window; order-linked images are kept as long as needed to fulfill and support the order, then pruned. *(Exact windows are an open question — see PRD §13 #3 — and must be decided before launch and recorded here.)*
- **No analytics/crash SDKs** (PostHog/Sentry) in POC.
- **Be honest in user-facing copy** about what we generate and keep (photo → AI proof → printed product) before the upload ask.

---

## 8. Current Standard — At a Glance

| Control | Status | Reference |
|---|---|---|
| All secrets server-side only | ✅ Enforced | §3 |
| No fal key in the browser (draft flow removed) | ✅ Enforced | §3, §4 |
| `/api/generate` rate-limited + free-capped | ✅ Enforced | §4 |
| Uploads validated server-side (type + size) | ✅ Enforced | §5 |
| Stripe webhook signature verified | ✅ Enforced | §6 |
| Webhook / fulfillment idempotent | ✅ Enforced | §6 |
| Charged amount comes from server/DB | ✅ Enforced | §6 |
| No card data stored | ✅ Enforced | §2, §6 |
| `/admin` gated by env secret | ✅ Enforced | §2 |
| Signed URLs for stored images | ✅ Target | §5 |
| **Shared rate-limit store (Redis/Upstash)** | ⏳ Deferred | §9 |
| **Image encryption at rest / advanced abuse defense** | ⏳ Deferred | §9 |
| **Defined retention auto-pruning job** | ⏳ Deferred | §9 |

---

## 9. Known Limitations & Deferred Hardening (Phase 2)

- **Rate limiting is simple/in-memory** in POC — fine for low traffic; move to a shared store before real scale.
- **No formal retention/pruning job** yet — policy defined in §7, automation deferred.
- **No observability/abuse monitoring** (Sentry/PostHog) — deferred.
- **No automated security gate in CI** — local `tsc`/lint/build by convention.
- **No account system** — session is an anonymous cookie; no auth beyond `/admin`'s shared secret.
- **Email not verified** — Stripe collects it; we don't independently verify.

When any of these is implemented, move it from §9 to §8 and log it below.

---

## 10. External Cross-Checks

- **Stripe dashboard:** webhook endpoint registered for the right environment; signing secret matches `STRIPE_WEBHOOK_SECRET`; test vs. live keys not mixed.
- **Supabase:** Storage bucket not publicly listable; service-role key only in server env.
- **fal.ai / Printful:** keys only in server env; usage/billing watched (the generation endpoint is the cost surface).
- **Vercel:** all secrets set as environment variables per environment; none committed.

---

## 11. Maintaining This Document

**Update triggers** (same session as the change):
- A new secret or third-party service is added → §2, §3, §8.
- Upload handling, generation limits, or rate limiting change → §4, §5.
- Payment/webhook handling changes → §6.
- New data collected/stored, or who can see it changes → §2, §7.
- A §9 deferred item is implemented → move to §8 and log below.

### Change Log

| Date | Change | Refs |
|---|---|---|
| (foundation) | Initial standard. Server-side-only secrets; removed the draft's browser fal-key flow; generation rate-limit + free cap; server-side upload validation; Stripe webhook verification + idempotency; PII isolation in `/admin`. | — |

---

*Last updated: foundation draft | That's My Dawg | POC*
