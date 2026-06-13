# That's My Dawg

Custom streetwear: a visitor uploads a photo of their dog, picks a pre-designed scene, and an AI swap drops their dog into the artwork — producing an instant on-screen **proof** before they order a printed oversized tee. Drop-shipped via print-on-demand.

> **POC build.** Scope is deliberately small (see [`PRD.md`](./PRD.md) §2). Build only what is marked POC. Phase 2 work (automated fulfillment, accounts) is documented but not built yet.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript — **full-stack**, no separate backend service |
| Hosting | Vercel (Hobby/free for POC) |
| Database | PostgreSQL (Supabase free tier) via Prisma |
| Image storage | Supabase Storage (dog uploads + generated proofs) |
| AI generation | fal.ai → Gemini 2.5 Flash Image edit (the dog swap) |
| Payments | Stripe Checkout |
| Fulfillment | Printful (manual in Phase 1; automated in Phase 2) |
| Issue tracking | GitHub Issues + Projects |
| Library docs | Context7 (MCP) |

Secrets (`FAL_KEY`, `STRIPE_SECRET_KEY`, `PRINTFUL_API_KEY`, Supabase service key) live **only** in server-side env vars — never in client code. See [`docs/security-and-privacy.md`](./docs/security-and-privacy.md).

## Structure

```
/
├── README.md                     This file
├── CLAUDE.md                     AI development standards — Claude reads first, every session
├── PRD.md                        Product requirements — what to build and why
├── DESIGN.md                     Design system & visual language (from the website draft)
├── HOW_TO_WORK_WITH_CLAUDE.md    Copy-paste session templates
├── TASKS.md                      Lightweight backlog mirror of GitHub Issues
├── .env.example                  All required env vars (no real values)
├── prisma/schema.prisma          Database schema
├── docs/                         API reference + workflow + security
│   ├── README.md                 API index
│   ├── api/                      One file per endpoint group
│   ├── data-model.md             Schema reference
│   ├── workflow.md               Branching, deploy, sync workflow
│   └── security-and-privacy.md   Security & privacy standard
├── src/
│   ├── app/                      Routes (storefront) + /api route handlers + /admin
│   ├── components/               React components
│   ├── lib/                      fal, stripe, printful, storage, db, session helpers
│   └── constants.ts              POC limits, prices, model ids — never hardcode inline
└── public/scenes/                Scene artwork (or served from Supabase Storage)
```

## Getting started

> One-time manual setup (accounts, keys, MCP) is listed in [`HOW_TO_WORK_WITH_CLAUDE.md`](./HOW_TO_WORK_WITH_CLAUDE.md) §0. Claude cannot do those steps for you.

```bash
npm install
cp .env.example .env.local      # fill in your values
npx prisma migrate dev          # create the schema in your dev database
npm run dev                     # http://localhost:3000
```

## Branch strategy

```
main                      → production (Vercel production deploy)
dev                       → integration (Vercel preview)
feature/<issue#>-<slug>   → one branch per GitHub issue
```

Vercel auto-deploys: `main` → production, every PR → its own preview URL. Full branching, CI, deploy, and post-merge sync workflow in **[docs/workflow.md](./docs/workflow.md)**. After merging a feature PR, tell Claude **"merged #N"** so it re-syncs `dev`.
