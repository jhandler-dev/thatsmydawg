# That's My Dawg — POC Roadmap

> The build plan for the Phase 1 (POC) ship, organized the way we manage work in GitHub:
> **Milestones → Epics → Work Items (issues)**, in dependency order, each with an owner.
> Companion to [`PRD.md`](./PRD.md) (what/why), [`CLAUDE.md`](./CLAUDE.md) (how), and
> [`docs/workflow.md`](./docs/workflow.md) (branch/PR/deploy flow).
>
> Issue numbers are assigned when these are created in GitHub. The `W#` ids below are
> stable references for *this document only* and map 1:1 to a GitHub issue.

---

## 0. How to read this (plain-language primer)

If you're new to this style of project tracking, here are the only five terms you need:

| Term | What it means here | Analogy |
|---|---|---|
| **Milestone** | A dated *ship target* that groups many issues. "Done with M3" = a whole capability works end-to-end. | A chapter of the book |
| **Epic** | A large body of related work inside a milestone, made of several issues. | A section in the chapter |
| **Work Item / Issue** | One concrete, testable unit of work. Becomes one GitHub issue → one branch → one PR. | A paragraph |
| **Branch** | A private copy of the code where one issue is built, so `main`/`dev` stay stable. | A draft you edit before publishing |
| **PR (Pull Request)** | The request to merge a finished branch into `dev`. You review + click merge. | Submitting the draft for approval |

**The loop for every ⚡ work item** (from [`docs/workflow.md`](./docs/workflow.md)):
`I branch off dev` → `I build + run local checks` → `I open a PR into dev` → **`you review + merge on GitHub`** → `you tell me "merged #N"` → `I re-sync dev`.

**Ownership legend:**

| Symbol | Meaning |
|---|---|
| ⚡ **Claude** | I do it in a coding session. You review + merge the PR. |
| 👤 **You** | Only you can — needs your account, credit card, a dashboard click, or a real-world action. I'll give exact steps. |
| 🤝 **Both** | I prepare/guide; you do a step that needs your hands (a key, a CLI on your machine, a judgment call). |

**Why so many 👤 items up front:** I can write all the code, but I cannot create accounts, hold your credit card, or click buttons in Stripe/Supabase/Vercel for you. Those are the gates. Everything I build needs those keys to actually run, so we front-load them.

---

## 1. The whole plan at a glance

```
M0  Foundations & Accounts      ── get every key + the project wired   (mostly 👤)
        │
M1  App Skeleton                ── empty-but-running Next.js app        (⚡)
        │
M2  Storefront                  ── the public store renders scenes      (⚡)
        │
M3  Proof Generation            ── upload dog → AI proof appears         (⚡, 👤 fal key)
        │
M4  Checkout & Orders           ── pay with Stripe, order saved          (⚡, 👤 stripe keys)
        │
M5  Fulfillment                 ── /admin to ship orders by hand         (⚡ build, 👤 operate)
        │
M6  Launch Readiness            ── deployed, tested, open questions closed (🤝)
```

Each milestone depends on the one before it. Within a milestone, items are listed in the order they should be built.

---

## 2. Milestone 0 — Foundations & Accounts

**Goal:** every external account exists, every key is in `.env.local`, and the project is wired to GitHub + Vercel. **Nothing I build can run until this is done**, so this is the real starting line.

**Exit criteria:** `.env.local` has a real value for every line in [`.env.example`](./.env.example); the repo is on GitHub; a Vercel project is linked; GitHub MCP is connected.

### Epic A — External accounts & API keys

> These are the keys the app uses. Treat every value as a password — never paste them into chat, commits, or screenshots. They go **only** in `.env.local` (your machine) and the Vercel dashboard.

| ID | Owner | Item | Status |
|---|---|---|---|
| **W1** | 👤 | **GitHub repo created + scaffold pushed** | ✅ Done |
| **W2** | 👤 | **Connect GitHub MCP** in Claude settings, authorized against `jhandler-dev/thatsmydawg` | ☐ |
| **W3** | 👤 | **Vercel project** — create account, "Add New Project", import `jhandler-dev/thatsmydawg`, framework = Next.js. Don't worry about env vars yet (W46). | ☐ |
| **W4** | 👤 | **Supabase project** — create a free project. From *Project Settings → Database* copy the **Connection string** (pooled, port 6543) → `DATABASE_URL`, and the **direct** one (port 5432) → `DIRECT_URL`. From *Project Settings → API* copy the project URL → `SUPABASE_URL` and the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`. In *Storage*, create a bucket named `dawg-uploads` (set it **not public**). | ☐ |
| **W5** | 👤 | **fal.ai account** — sign up at fal.ai, create an API key → `FAL_KEY`. Add a small amount of billing credit (generations cost ~$0.04 each). | ☐ |
| **W6** | 👤 | **Stripe account (TEST mode)** — sign up, stay in **Test mode** (toggle, top-right). From *Developers → API keys* copy the **Secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY` and **Publishable key** (`pk_test_…`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. The webhook secret comes later in W39. | ☐ |
| **W7** | 👤 | **Printful account** — sign up. No key needed for Phase 1 (we fulfill by hand); you'll use its dashboard in W45. | ☐ |
| **W8** | 👤 | **Pick the blank tee + colors** — ✅ **Done.** Blank = **AS Colour 5082** (Men's Oversized Faded Tee, ~$23.92 base). Per-scene colors locked in [`docs/blank-and-colors.md`](./docs/blank-and-colors.md) (Faded Black / Faded Khaki / Faded White) — the source of truth for W19 seeding. | ✅ |
| **W9** | 👤 | **Fill `.env.local`** — copy `.env.example` to `.env.local`, paste every value from W4–W6 and a chosen `ADMIN_PASSWORD`. This file is git-ignored — it never leaves your machine. | ☐ |

**Acceptance for Epic A:** every line in [`.env.example`](./.env.example) has a real value in your local `.env.local`, and the Supabase `dawg-uploads` bucket exists.

### Epic B — Project management setup

| ID | Owner | Item | Detail |
|---|---|---|---|
| **W10** | ⚡ | **Create GitHub milestones, labels, and all issues** | Once W2 (MCP) is done, I create the 6 milestones (M1–M6), a small label set (`epic`, `claude`, `you`, `phase-1`, `blocked`), and one issue per work item in this roadmap, each tagged + assigned to its milestone. One batch. |
| **W11** | ⚡ | **Commit this `ROADMAP.md`** | On a `chore/roadmap` branch → PR into `dev`. |

**Acceptance for Epic B:** GitHub *Issues* and *Milestones* tabs mirror this document.

---

## 3. Milestone 1 — App Skeleton

**Goal:** a real Next.js app that builds and runs locally with the design system and database wired — but no features yet. The "empty house with plumbing and power."

**Exit criteria:** `npm run dev` serves a dark-themed page at `localhost:3000`; `GET /api/health` returns `{ "status": "ok" }`; `npx prisma migrate dev` has created the tables in Supabase.

### Epic C — App skeleton & tooling (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W12** | ⚡ | `feature/<#>-scaffold-next-app` | W9 | **Scaffold the Next.js app.** Run `create-next-app` (App Router, TypeScript **strict**, Tailwind, ESLint) and reconcile it into the existing repo layout from [`CLAUDE.md §4.2`](./CLAUDE.md). Replace the stub [`package.json`](./package.json) with real, Context7-verified versions. |
| **W13** | ⚡ | `feature/<#>-prisma-client` | W12 | **Prisma client singleton** in `src/lib/db` so we never open duplicate DB connections in dev. |
| **W14** | ⚡ | `feature/<#>-health-route` | W12 | **`GET /api/health`** route returning `{ status: "ok" }` — the first proof the server runs (spec already in [`docs/README.md`](./docs/README.md)). |

**W12 acceptance:** `npm run dev`, `npm run build`, and `npm run typecheck` all succeed; `tsconfig` has `strict: true`; folder structure matches CLAUDE.md §4.2; no `any` anywhere.
**W14 acceptance:** visiting `/api/health` returns `200 { "status": "ok" }`.

### Epic D — Design system (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W15** | ⚡ | `feature/<#>-design-tokens` | W12 | **Map [`DESIGN.md`](./DESIGN.md) color tokens** (`black`, `charcoal`, `gold`, `cream`, etc.) into the Tailwind theme + CSS variables. Dark theme only. No inline hex anywhere after this. |
| **W16** | ⚡ | `feature/<#>-fonts` | W15 | **Load the three fonts** (Bebas Neue, DM Sans, Playfair Display) via `next/font` and set the base typographic scale from DESIGN §3. |
| **W17** | ⚡ | `feature/<#>-base-layout` | W16 | **Root layout + global styles** — dark `black` background, `cream` text, `prefers-reduced-motion` handling, 44px touch-target baseline. |

**Epic D acceptance:** a throwaway test page renders headings in Bebas and body in DM Sans on the dark/gold palette, all from tokens.

### Epic E — Data layer (⚡ + 👤 confirm)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W18** | 🤝 | `feature/<#>-first-migration` | W13, W4 | **First Prisma migration** — I show you the SQL, **you confirm**, then `npx prisma migrate dev` creates `Scene`/`Proof`/`Order` in Supabase. (Schema already written in [`prisma/schema.prisma`](./prisma/schema.prisma).) |
| **W19** | ⚡ | `feature/<#>-seed-scenes` | W18, W8 | **Seed script** (`prisma/seed.mjs`, referenced by `npm run db:seed`) inserting the launch scenes (the draft's "Bar Dog", "The Therapist", etc.) as `Scene` rows. Uses W8 colors if decided, placeholders otherwise. |
| **W20** | ⚡ | `feature/<#>-storage-helper` | W12, W4 | **Supabase Storage helper** (`src/lib/storage`) — upload to a per-session path, return a time-limited **signed URL**. Used by uploads (W30) and proofs (W33). |
| **W21** | ⚡ | `feature/<#>-session-cookie` | W12 | **Anonymous session helper** (`src/lib/session`) — issues a cookie id that ties a browser's uploads/proofs/orders together without a login. |

**W18 acceptance:** the three tables exist in Supabase (visible in its Table Editor).
**W19 acceptance:** `npm run db:seed` populates ≥3 active scenes; re-running it doesn't duplicate them.

---

## 4. Milestone 2 — Storefront

**Goal:** the public store page renders the hero and a live grid of scenes pulled from the database. No ordering yet — just the shop window.

**Exit criteria:** `localhost:3000` shows nav, ticker, hero, and a scene grid populated from `GET /api/scenes`, with designed empty/error states.

### Epic F — Storefront UI (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W22** | ⚡ | `feature/<#>-scenes-api` | W19 | **`GET /api/scenes`** — returns active scenes, sorted by `sortOrder` (spec in [`docs/api/scenes.md`](./docs/api/scenes.md)). |
| **W23** | ⚡ | `feature/<#>-nav-ticker` | W17 | **Nav + Ticker** — fixed translucent nav with gold logo accent; the scrolling gold marquee ticker (DESIGN §5). |
| **W24** | ⚡ | `feature/<#>-hero` | W17 | **Hero** — ~92vh, radial gold glow, eyebrow → giant Bebas title → subline → buttons, with fade-up entrance. |
| **W25** | ⚡ | `feature/<#>-scene-grid` | W22, W23 | **SceneGrid + SceneCard** — consumes `/api/scenes`; each card shows art, name, blurb, gold price, badge. **Designed empty state** (no scenes) and **image-failure placeholder** — never a broken-image icon. Clicking a card opens the order flow (built in M3). |
| **W26** | ⚡ | `feature/<#>-static-sections` | W17 | **HowItWorks, Reviews (static copy), FAQ (expandable), Footer.** |
| **W27** | ⚡ | `feature/<#>-storefront-page` | W24, W25, W26 | **Assemble the storefront page** — compose all sections into `/` in the draft's order. |

**Epic F acceptance:** the store renders end-to-end from real DB data; turning a scene `active=false` removes it from the grid; an empty DB shows the friendly empty state, not a blank page.

---

## 5. Milestone 3 — Proof Generation (the core magic)

**Goal:** a visitor opens a scene, uploads their dog, and an AI-composited proof appears — capped and rate-limited so it can't drain money. This is the feature the whole product rests on.

**Exit criteria:** in the order flow you can upload a photo, click Generate, watch a designed loading state, and see a proof; you can regenerate up to the free cap; failures show a retry, never a charge.

### Epic G — Dog upload (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W28** | ⚡ | `feature/<#>-order-modal` | W25 | **OrderModal shell** — the full-screen dark modal that hosts the upload → proof → size → checkout steps (DESIGN §5). Opens from a scene card. |
| **W29** | ⚡ | `feature/<#>-upload-ui` | W28 | **Upload zone UI** — dashed gold-tint drop area, file picker, image preview, **client-side** validation (type + size from [`src/constants.ts`](./src/constants.ts)), inline errors. |
| **W30** | ⚡ | `feature/<#>-upload-api` | W29, W20, W21 | **`POST /api/upload`** — re-validate type + size **server-side** (never trust the client), store under the per-session path, return a signed URL. Rejects bad input with `{ error, code }`. |

**Epic G acceptance:** uploading a 12MB file or a `.gif` is rejected with a clear message both in the UI and at the API; a valid JPG/PNG/WEBP previews and lands in Supabase Storage under the session path.

### Epic H — AI proof generation (⚡, needs 👤 fal key)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W31** | ⚡ | `feature/<#>-fal-client` | W12, W5 | **fal client** (`src/lib/fal`, holds `FAL_KEY` server-side only) + a **per-scene prompt map** describing how the dog sits in each scene's style (PRD §9). |
| **W32** | ⚡ | `feature/<#>-rate-limit` | W21 | **In-memory rate limiter + free-proof cap** helpers — `GENERATE_RATE_PER_MIN` and `MAX_FREE_PROOFS_PER_SESSION` from `constants.ts`, enforced **server-side**. (Shared Redis store is Phase 2.) |
| **W33** | ⚡ | `feature/<#>-generate-api` | W31, W32, W30 | **`POST /api/generate`** — validate `sceneId` + photo, enforce rate + cap, call fal, store the proof image, write a `Proof` row, return the proof URL (spec in [`docs/api/generate.md`](./docs/api/generate.md)). Structured error on failure. |
| **W34** | ⚡ | `feature/<#>-proof-display` | W33 | **Proof display + loading + regenerate** — designed spinner with rotating status copy during the multi-second call; show the proof; **Regenerate** within the cap; on cap reached, explain and steer to ordering; on failure, retry with no charge. |

**Epic H acceptance:** a real generation returns a believable proof; the 4th generation in a session is blocked by the cap with a clear message; hammering the endpoint trips the per-minute rate limit; a forced failure shows retry and never advances to checkout; `FAL_KEY` appears in **no** browser bundle.

### Epic I — Size & summary (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W35** | ⚡ | `feature/<#>-size-picker` | W34 | **Size picker + order summary** — choose a size from `SIZES`; shirt color is fixed per scene; show the gold price from the scene; "Order" stays disabled until a size is chosen. |

**Epic I acceptance:** checkout is blocked until a valid size is selected; the price shown equals the scene's `priceCents`.

---

## 6. Milestone 4 — Checkout & Orders

**Goal:** the customer pays on Stripe's hosted page, the order is saved, and a verified webhook marks it paid with the shipping address captured. **Real money (test mode first).**

**Exit criteria:** clicking Order opens Stripe Checkout; paying with a Stripe test card returns to a success screen; the order shows in the DB as `paid` with email + shipping; cancelling preserves the proof.

### Epic J — Stripe checkout (⚡, needs 👤 keys)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W36** | ⚡ | `feature/<#>-stripe-client` | W12, W6 | **Stripe client** (`src/lib/stripe`, holds `STRIPE_SECRET_KEY`) + a checkout-session helper. |
| **W37** | ⚡ | `feature/<#>-checkout-api` | W36, W35 | **`POST /api/checkout`** — create a pending `Order` and a Stripe Checkout Session; **amount comes from the DB scene price, never the client**; Stripe collects email + shipping (spec in [`docs/api/checkout.md`](./docs/api/checkout.md)). |

### Epic K — Webhook & persistence (⚡, needs 👤 webhook secret + Stripe CLI)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W38** | ⚡ | `feature/<#>-stripe-webhook` | W37 | **`POST /api/webhooks/stripe`** — **verify the signature** with `STRIPE_WEBHOOK_SECRET`, be **idempotent** (duplicate deliveries never double-mark/double-fulfill), mark the order `paid`, store the payment intent + email + shipping. Hard security requirement ([`docs/security-and-privacy.md §6`](./docs/security-and-privacy.md)). |
| **W39** | 🤝 | — | W38 | **Local webhook testing** — I write the steps; **you** run the Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`), which prints the `whsec_…` value for `STRIPE_WEBHOOK_SECRET`. We test with `stripe trigger checkout.session.completed`. |

### Epic L — Post-checkout screens (⚡)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W40** | ⚡ | `feature/<#>-success-page` | W37 | **`/checkout/success`** — "Your proof is locked in, printing soon" confirmation (Stripe `return_url`). |
| **W41** | ⚡ | `feature/<#>-cancel-page` | W37 | **`/checkout/cancel`** — returns to the scene with the proof **intact**; no order created. |

**Milestone 4 acceptance:** a full test-card purchase moves an order to `paid` with shipping captured; replaying the webhook doesn't create a second order; cancelling returns cleanly with the proof preserved; a tampered/invalid webhook body is rejected.

---

## 7. Milestone 5 — Fulfillment (manual, Phase 1)

**Goal:** a password-protected `/admin` page where you see paid orders and ship them by hand through Printful. This is the deliberate manual seam Phase 2 later automates.

**Exit criteria:** `/admin` (behind `ADMIN_PASSWORD`) lists paid orders with proof + size + address; you can flip an order to `fulfilled` and paste a Printful order id.

### Epic M — Admin fulfillment (⚡ build, 👤 operate)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W42** | ⚡ | `feature/<#>-admin-auth` | W12 | **Admin auth gate** — a shared-secret check against `ADMIN_PASSWORD` (PRD §4 F6). Wrong password → denied, no detail leak. Not a real account system (that's Phase 2). |
| **W43** | ⚡ | `feature/<#>-orders-api` | W42, W38 | **`GET /api/orders` + `PATCH /api/orders/:id`** — admin-only list + status update (spec in [`docs/api/orders.md`](./docs/api/orders.md)). |
| **W44** | ⚡ | `feature/<#>-admin-view` | W43 | **`/admin` view** — list paid orders with the proof image, size, shipping address; button to flip `paid → fulfilled`; field to paste the Printful order id / tracking. |
| **W45** | 👤 | — | W44 | **Place the first real Printful order by hand** — using the details from `/admin`, order the blank from W8 on Printful, then paste the Printful order id back into `/admin`. |

**Milestone 5 acceptance:** `/admin` is unreachable without the password; a paid order can be marked fulfilled and shows its Printful reference afterward.

---

## 8. Milestone 6 — Launch Readiness

**Goal:** the app is deployed on Vercel, the open product questions are answered, and the full flow has been tested end-to-end on the live preview. Then (when you're ready) flip Stripe to live and promote to production.

### Epic N — Deployment (🤝)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W46** | 👤 | — | W3 | **Set all env vars in Vercel** — add every value from `.env.local` to the Vercel project (Preview + Production). A feature that reads a new env var works locally but breaks on Vercel until this is done. |
| **W47** | ⚡ | `feature/<#>-vercel-build` | W12 | **Vercel build config** — ensure `prisma generate` runs on build and the app deploys cleanly to a preview URL. |
| **W48** | 🤝 | — | W47, W38 | **Register the Stripe webhook to the deployed URL** — I give the path; **you** add the endpoint in the Stripe dashboard and copy its signing secret into Vercel env. |

### Epic O — QA & launch (🤝)

| ID | Owner | Branch | Depends on | Item |
|---|---|---|---|---|
| **W49** | ⚡ | — | M5 done | **End-to-end QA pass** — I run/document the full happy path + every dead-end (upload fail, generation fail, cap reached, payment cancel, bad webhook) and hand you a test-case checklist. |
| **W50** | 🤝 | — | — | **Close the open product questions** (PRD §13): final retail price, free-proof cap value, and the photo/proof **retention window** (must be recorded in the security doc before launch). |
| **W51** | 👤 | — | W49, W50 | **Go live** — flip Stripe to **live** keys, say "promote dev → main", merge, and tag the release (`v0.1.0`). Vercel redeploys production automatically. |

**Milestone 6 acceptance:** the full purchase flow works on the deployed preview with test keys; open questions are answered and documented; production is tagged and live.

---

## 9. Ownership summary

**What only you can do (👤):** W2–W9 (accounts, keys, `.env.local`, blank/color choice), W45 (first Printful order), W46 (Vercel env), W48 (Stripe webhook registration — your half), W50 (product decisions), W51 (go live). **These are the gates — the sooner W2–W9 are done, the sooner I'm unblocked.**

**What I do (⚡):** essentially all the code — W10–W44, W47, and the QA pass (W49). You review and merge each PR.

**Shared (🤝):** W18 (you confirm the migration), W39 (you run the Stripe CLI), W48 (you register the webhook), W50 (we decide together).

---

## 10. Critical path (the shortest line to a working demo)

If you want the fastest route to "I can buy a dog shirt with a test card," the minimum chain is:

```
W2→W9 (keys)  →  W12,W13,W14 (skeleton)  →  W18,W19 (db + scenes)
   →  W22,W25 (scenes show)  →  W28,W29,W30 (upload)
   →  W31,W32,W33,W34 (proof)  →  W35 (size)
   →  W36,W37,W38,W39 (pay + webhook)  →  W40 (success)
```

Storefront polish (W23/W24/W26), admin (M5), and deployment (M6) can follow once that core line works locally.

---

*Last updated: roadmap draft | That's My Dawg | POC*
