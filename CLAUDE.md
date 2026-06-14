# CLAUDE.md — That's My Dawg

> Source of truth for all AI-assisted development on this project.
> Claude reads this file at the start of every session, without exception.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ⚡ | Claude can and should do this automatically |
| 👤 | You (the developer) must do this manually |
| 🚫 | Never do this |
| 📌 | POC scope |
| 🔮 | Post-POC / deferred (Phase 2) |

---

## 0. Project Document Map

All core docs live in the repo root; API + workflow + security live in `/docs`. Claude reads every relevant document before writing code.

| Document | Purpose | Read When | Update When |
|----------|---------|-----------|-------------|
| `CLAUDE.md` (this file) | Dev standards, session rules, MCP tools, git workflow | Every session | A standard changes or a new tool is added |
| `PRD.md` | Product decisions — what to build and why, POC scope, phasing | Starting any feature | A product decision changes — update PRD first |
| `DESIGN.md` | Visual language, tokens, component patterns | Building any UI | A token or pattern changes |
| `/docs/api/*.md` | API reference — endpoints, request/response shapes | Before implementing or calling any endpoint | Same session as any endpoint change |
| `/docs/data-model.md` | Schema reference | Before any schema/Prisma change | Same session as a schema change |
| `/docs/security-and-privacy.md` | Data handling, secrets, uploads, payments, privacy | Before touching uploads, payments, secrets, or data handling | Same session as any such change |
| GitHub Issues | Issue tracker — features, bugs, ownership | Every session — issue # anchors every branch/commit | Status + completion comments |

**Quick reference:**
- *"What should this feature do?"* → `PRD.md`
- *"What does this look like?"* → `DESIGN.md`
- *"What does this endpoint look like?"* → `/docs/api/`
- *"How do we handle data / secrets / payments?"* → `/docs/security-and-privacy.md`
- *"How do I write this correctly?"* → `CLAUDE.md`
- *"What am I building this session?"* → the GitHub issue

---

## 1. Project Context

**Stack (POC):**
- Next.js (App Router), React, TypeScript (strict) — **full-stack**; server-side logic lives in `/api` route handlers, not a separate service
- PostgreSQL (Supabase) via Prisma
- Supabase Storage (dog uploads + proofs)
- fal.ai (Gemini 2.5 Flash Image edit) for the dog swap
- Stripe Checkout for payments
- Printful for fulfillment (manual in Phase 1)
- Tailwind CSS mapped to `DESIGN.md` tokens
- GitHub for version control + issues; Vercel for hosting

**Why no separate backend:** Next.js route handlers *are* the backend. Secrets stay server-side there; the browser never holds an API key. This is the single most important architectural rule on the project (see §5).

---

## 2. Non-Negotiable Ground Rules

Apply to every file, every session.

1. **Read before writing.** ⚡ Always read the existing file before editing.
2. **Use Context7 for all library docs.** ⚡ Before writing code that uses any library (Next.js, Prisma, Stripe, fal, Supabase, Tailwind), fetch current docs via Context7. Never rely on training data for API details — these move fast.
3. **Secrets are server-only.** 🚫 Never put `FAL_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRINTFUL_API_KEY`, or the Supabase service-role key in client components, `NEXT_PUBLIC_*` vars, or anything shipped to the browser. Generation, checkout, and fulfillment go through `/api` route handlers.
4. **One concern per file.** A file that does two things should be two files.
5. **No placeholders in committed code.** `// TODO` / `// FIXME` require a linked GitHub issue. Exception: `// TODO: POST-POC` for intentional Phase 2 deferrals.
6. **Errors are values.** Typed error handling; no silent failures. Every async path has an error branch with user-visible feedback.
7. **No `any` in TypeScript.** Use `unknown` and narrow, or define a proper type.
8. **Limits & prices come from `constants.ts`.** 🚫 Never hardcode a price, size list, upload limit, rate limit, or proof cap inline.
9. **Validate every mutating route's input.** Use a schema (e.g. Zod). Reject bad input with a structured error.
10. **Check `/docs/api` before implementing or calling any endpoint.** ⚡
11. **Never commit secrets.** `.env*` is git-ignored; `.env.example` holds placeholders only.
12. **Bulkify.** When a change spans a route + a Prisma model + a component + a `/docs` file, implement them together in one response and summarize at the end.

---

## 3. Efficiency Rules

- **State assumptions inline, don't ask.** Reasonable default exists → take it, note it, proceed.
- **Batch related changes** across route/model/component/docs in one response.
- **Batch GitHub issue creation** when breaking down a milestone — one MCP pass.
- **One question max per response**, and only if truly blocking.
- **Deliver complete, runnable code.** No "add your logic here". Unknown external value → `// TODO: [YOUR VALUE]` with an explanation.
- **Don't re-explain standards** unless asked. **Skip pleasantries** — lead with the answer or the code.

---

## 4. TypeScript / Next.js Standards

### 4.1 Compiler & lint
- TypeScript `strict: true`; no `any`.
- ESLint + the Next.js config; resolve all violations before pushing.
- Prefer Server Components by default; use Client Components (`"use client"`) only where interactivity requires it (upload widget, modal, size picker).

### 4.2 Architecture
```
app/ (routes)
 ├── page + section components  (Server Components by default)
 ├── client components          ("use client" — upload, modal, pickers)
 └── api/<route>/route.ts       (server handlers — hold secrets, call lib/)
lib/
 ├── db/        Prisma client (singleton)
 ├── fal/       generation client (FAL_KEY)
 ├── stripe/    checkout + webhook helpers (STRIPE_SECRET_KEY)
 ├── printful/  fulfillment client (Phase 2; manual in Phase 1)
 ├── storage/   Supabase Storage upload/signed-URL helpers
 └── session/   anonymous session id (cookie)
constants.ts    POC limits, prices, sizes, model id
```
- Components hold no secret keys and no direct DB calls — they call `/api` routes or server actions.
- `lib/*` modules are the only place that talks to external services.
- Models/types are plain TypeScript types/interfaces; Prisma generates DB types.

### 4.3 Naming
| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `SceneCard.tsx` |
| Functions/vars | camelCase | `createCheckoutSession()` |
| Route handlers | `route.ts` in the route folder | `app/api/generate/route.ts` |
| Booleans | `is`/`has`/`can`/`should` | `isGenerating` |
| Constants | UPPER_SNAKE in `constants.ts` | `MAX_FREE_PROOFS_PER_SESSION` |

### 4.4 API route pattern
```ts
// app/api/<thing>/route.ts
export async function POST(req: Request) {
  // 1. parse + validate body (Zod) → 422 on failure
  // 2. enforce limits/rate from constants.ts
  // 3. call lib/* (which holds the secret) — never the browser
  // 4. return a typed JSON result, or a structured { error, code } on failure
}
```
- Uniform error shape: `{ error: string, code: string }`. No stack traces or internal paths to the client.
- ⚡ Check `/docs/api/<thing>.md` before implementing.

### 4.5 Data access
- All DB access via the Prisma singleton in `lib/db`. No raw SQL string interpolation. Multi-row writes use transactions. Select only needed fields.
- 🚫 Never modify `prisma/schema.prisma` without confirming intent first; show the migration before applying.

### 4.6 Design system
- Use Tailwind tokens / CSS variables mapped from `DESIGN.md`. 🚫 No inline hex, no ad-hoc font sizes. Load fonts via `next/font`.

### 4.7 Accessibility (POC basics)
- 44px touch targets, labelled inputs and buttons, `alt` text, visible focus, `prefers-reduced-motion`. Full audit is 🔮 Post-POC.

---

## 5. Security Rules (operationalized in `/docs/security-and-privacy.md`)

- 🚫 No secret keys in the browser, ever. The removed draft behavior (fal key in `localStorage`) must never return.
- ✅ Stripe webhook handlers **verify the signature** with `STRIPE_WEBHOOK_SECRET` and are **idempotent**.
- ✅ Uploads validate type + size server-side (not just client-side); store under per-session paths; serve via signed URLs.
- ✅ `/api/generate` is rate-limited and free-capped from `constants.ts`.
- ✅ `/admin` is gated by a shared secret from env (POC) — never an open route.
- ✅ We never store card data — Stripe handles it. We store only what Stripe returns (email, shipping) for fulfillment.

---

## 6. MCP Tools

### GitHub MCP ⚡
Claude uses it to create branches, open PRs, and manage **GitHub Issues** (our tracker — no Linear).
```
"Use GitHub MCP to open a PR from feature/12-scene-grid into dev"
"Use GitHub MCP to create issues for the Phase 1 breakdown"
"Use GitHub MCP to close #12 with a completion comment"
```
👤 **Setup once:** connect GitHub MCP in Claude settings, authorized against this repo.

### Context7 ⚡
Fetch current docs for any library before writing code that uses it.
```
"Use Context7 for Next.js App Router route handlers"
"Use Context7 for the Stripe Node SDK checkout.sessions API"
"Use Context7 for fal.ai JS client / queue API"
"Use Context7 for Prisma 6 + Supabase connection"
```

---

## 7. Issue Tracking (GitHub Issues — replaces Linear)

Every unit of work is a GitHub issue, tracked on the **[Project board](https://github.com/users/jhandler-dev/projects/2)** (grouped by Milestone M0–M6, with an Owner field). `ROADMAP.md` holds the plan + acceptance criteria; `TASKS.md` is now just a pointer to the board.

**Issue template Claude uses:**
```
Title: <feature or bug>
Owner: ⚡ Claude / 👤 You
Phase: 1 (POC) / 2 (deferred)
Priority: Urgent / High / Medium / Low
Description: what and why
Acceptance criteria:
  - [ ] specific, testable
POC notes: deferrals / simplifications
```

**Ownership:**
| Owner | Meaning | Examples |
|---|---|---|
| ⚡ Claude | Implements during a session; you review/merge | route handlers, components, Prisma models, `/docs` updates |
| 👤 You | Manual; Claude can't | create accounts/keys, set Vercel/Supabase/Stripe/fal env vars, place manual Printful orders, review+merge PRs |

Branch: `feature/<issue#>-<slug>` (or `fix/<issue#>-<slug>`). Commit: `type(scope): summary — #<issue>`.

---

## 8. Git Workflow (summary — full detail in `docs/workflow.md`)

```
main                      → production (Vercel production)
dev                       → integration (Vercel preview)
feature/<issue#>-<slug>   → cut from dev, one per issue
```
- ⚡ Claude: `git checkout dev && git pull`, branch, implement, run local checks (`tsc --noEmit`, lint, `next build`), push `-u`, open PR **into `dev`** via GitHub MCP.
- 👤 You: review + merge on GitHub.
- ⚡ After you say **"merged #N"**: Claude checks out `dev`, pulls, deletes the merged branch, confirms a clean in-sync tree. (Skipping this = testing stale code.)
- 🚫 Never commit directly to `dev` or `main`. 🚫 Never `git add .` — stage specific files.

**Commit format:**
```
type(scope): short description — #<issue>
```
Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`
Scopes: `web`, `api`, `db`, `lib`, `design`, `infra`

Examples:
```
feat(web): build scene grid + scene card — #4
feat(api): add /api/generate dog-swap route — #6
fix(api): verify stripe webhook signature — #11
docs: document /api/checkout request shape — #9
```

---

## 9. Session Structure

### Start
1. ⚡ Read `CLAUDE.md` + `PRD.md` (+ `DESIGN.md` for UI work).
2. ⚡ Pull the GitHub issue; read acceptance criteria.
3. ⚡ Read `/docs/api` + `/docs/data-model.md` if endpoints/schema are involved.
4. ⚡ Use Context7 for any libraries involved.
5. ⚡ `git checkout dev && git pull`, create the feature branch, push `-u`.

You provide: the issue #, any files/paths to read, current state (done/broken/careful), and a POC reminder if relevant.

### During
- ⚡ Implement, validate inputs, handle errors, test where it makes sense.
- ⚡ Update `/docs` if endpoints/schema change.
- ⚡ Flag any scope discovered mid-session that isn't in the issue before doing it.

### End ⚡
1. Self-review against acceptance criteria.
2. Verify: no `any`, no inline secrets, no hardcoded limits/prices, inputs validated.
3. Verify: `/docs` updated if endpoint/schema changed.
4. Run local checks (`tsc --noEmit`, lint, `next build`).
5. Commit (correct format), push, open PR into `dev` via GitHub MCP.
6. Update the issue: completion comment (what was built, MCP tools used, docs touched, POC deferrals, files changed, follow-ups).

---

## 10. POC Boundaries

📌 **In scope (Phase 1):**
- Scene gallery, dog upload, **one** cheap proof generation (Gemini 2.5 Flash, capped), size pick, Stripe Checkout, order persisted, **manual** Printful fulfillment via `/admin`.
- Guest checkout only. USD. Dark theme only.
- Console-logged order notifications (`// TODO: POST-POC` — Stripe still sends its receipt).
- Simple in-memory/simple rate limiting (no Redis).

🔮 **Deferred (Phase 2):**
- Automated Printful order creation; high-res print regeneration (Nano Banana Pro).
- Accounts/login; order history portal; scene CMS; multi-item cart.
- Email SDK (Resend); Redis/Upstash rate store; Sentry/PostHog; live Claude prompt-builder.

**Deferral comment pattern:**
```ts
// TODO: POST-POC — automate via Printful API (see #<issue>)
console.log('[ORDER] paid', { orderId, email }); // TODO: POST-POC — send via Resend
```

---

## 11. What Claude Should Never Do

- 🚫 Put any secret key in client code, a `NEXT_PUBLIC_*` var, or anything shipped to the browser.
- 🚫 Re-introduce the draft's browser-side fal-key flow.
- 🚫 Skip Stripe webhook signature verification, or make the webhook non-idempotent.
- 🚫 Modify `prisma/schema.prisma` without confirming intent and showing the migration.
- 🚫 Install npm packages without asking first.
- 🚫 Change tests to make them pass — fix the implementation.
- 🚫 Use `git add .` — stage specific files.
- 🚫 Hardcode a price/size/limit inline — use `constants.ts`.
- 🚫 Add Phase 2 features during POC (automated fulfillment, accounts, CMS, cart, email SDK).
- 🚫 Commit to `dev` or `main` directly.
- 🚫 Skip updating `/docs` after changing an endpoint or schema.
- 🚫 Use a library API without Context7 when uncertain.
- 🚫 Leave a loading/empty/error state undesigned.

---

*Last updated: foundation draft | That's My Dawg | POC*
