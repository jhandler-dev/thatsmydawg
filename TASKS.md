# TASKS — That's My Dawg

> Human-readable mirror of GitHub Issues. The issues are the source of truth; this is the at-a-glance backlog.
> Owner: ⚡ Claude / 👤 You · Phase 1 = POC ship · Phase 2 = deferred.

## Phase 1 — POC (build these)

| # | Task | Owner | Status |
|---|------|-------|--------|
| — | Scaffold Next.js (App Router, TS, Tailwind) + Prisma + `lib/db` + `GET /api/health` | ⚡ | todo |
| — | Map DESIGN.md tokens into Tailwind; load Bebas / DM Sans / Playfair via next/font | ⚡ | todo |
| — | Prisma schema (Scene / Proof / Order) + first migration + seed scenes from the draft's SHIRTS | ⚡ | todo |
| — | Storefront: Nav, Ticker, Hero, HowItWorks, FAQ, Footer (from the draft) | ⚡ | todo |
| — | `GET /api/scenes` + SceneGrid + SceneCard | ⚡ | todo |
| — | Order flow modal: dog upload (client + server validation) → Supabase Storage | ⚡ | todo |
| — | `POST /api/generate` — fal dog swap, rate limit + free cap, store proof | ⚡ | todo |
| — | Proof display + regenerate (within cap) + size picker | ⚡ | todo |
| — | `POST /api/checkout` — Stripe Checkout Session (amount from DB) | ⚡ | todo |
| — | `POST /api/webhooks/stripe` — verify signature, idempotent, mark paid | ⚡ | todo |
| — | `/checkout/success` + `/checkout/cancel` screens | ⚡ | todo |
| — | `/admin` manual fulfillment view + `GET/PATCH /api/orders` (env-gated) | ⚡ | todo |
| — | Manual setup: accounts, keys, env vars, Vercel/Supabase/Stripe/fal/Printful | 👤 | todo |
| — | Pick the Printful oversized blank + per-scene colors | 👤 | todo |

## Phase 2 — Deferred (do NOT build during POC)

| # | Task | Owner |
|---|------|-------|
| — | Automated Printful order creation on payment (webhook → API) | ⚡ |
| — | High-res print regeneration (Nano Banana Pro) at fulfillment | ⚡ |
| — | Accounts / order history portal | ⚡ |
| — | Scene CMS / self-serve scene builder | ⚡ |
| — | Multi-item cart | ⚡ |
| — | Email SDK (Resend) for confirmations | ⚡ |
| — | Shared rate-limit store (Redis/Upstash) | ⚡ |
| — | Retention auto-pruning job for uploads/proofs | ⚡ |
| — | Observability (Sentry / PostHog) | ⚡ |

> Replace the `—` with the real issue number once created via GitHub MCP.
