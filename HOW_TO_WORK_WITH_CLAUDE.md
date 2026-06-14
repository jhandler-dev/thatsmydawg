# HOW TO WORK WITH CLAUDE — That's My Dawg

> Copy-paste templates for common tasks. Fill in the `[brackets]`.
> Keep this open during sessions. The better your opener, the faster Claude moves.
>
> 📄 For the branching / deploy / post-merge-sync workflow, see [`docs/workflow.md`](./docs/workflow.md). **Tell Claude "merged #N" right after merging a feature PR** so it re-syncs `dev`.

---

## Legend
| Symbol | Meaning |
|--------|---------|
| ⚡ | Claude does this automatically |
| 👤 | You must do this manually |
| 📋 | Copy-paste template |

---

## 0. One-Time Setup (👤 You)

Complete these before the first coding session. Claude cannot unblock any of them.

| Task | Notes |
|------|-------|
| Create the GitHub repo + push the scaffold | This foundation is your initial commit |
| Connect GitHub MCP to Claude | Authorize against this repo in Claude settings — needed for branches, PRs, and Issues |
| Create a Vercel project | Link it to the repo; `main` → production, PRs → previews |
| Create a Supabase project | Copy `DATABASE_URL` + `DIRECT_URL`; create a Storage bucket for uploads/proofs; copy the service-role key |
| Create a fal.ai account | Copy `FAL_KEY` |
| Create a Stripe account | Copy **test** secret + publishable keys; create a webhook + copy `STRIPE_WEBHOOK_SECRET` (use the Stripe CLI for local) |
| Create a Printful account | Manual fulfillment in Phase 1; API key needed for Phase 2 |
| Set env vars | `.env.local` (dev) and the Vercel dashboard (preview/prod). See `.env.example` |
| Pick the Printful blank + colors | Which oversized tee + which color per scene |

---

## 1. Starting a Session

### Project Initialization (first session ever)
📋
```
Starting That's My Dawg from the foundation scaffold.

Repo: [paste GitHub repo URL]

Read CLAUDE.md, PRD.md, and DESIGN.md (in the repo). Then:
1. Scaffold the Next.js (App Router, TS, Tailwind) app into /src per CLAUDE.md §4.2
2. Set up Prisma against my Supabase DATABASE_URL using prisma/schema.prisma
3. Create src/constants.ts with the POC values from PRD §8
4. Add lib/db (Prisma singleton) and a GET /api/health route
5. Map DESIGN.md tokens into Tailwind + load the three fonts via next/font
6. Open a PR into dev

POC mode: Phase 1 only, manual fulfillment, limits/prices from constants.ts.
```

### Standard Feature Session
📋
```
Starting #[issue] — [title].

POC mode: Phase 1, manual fulfillment, limits/prices from constants.ts.

Context:
- [files/paths Claude should read]
- [what's already done that's relevant]
- [anything broken or to be careful of]

Before writing code:
- Pull issue #[issue] and read acceptance criteria
- Use Context7 for [library, e.g. Stripe Node SDK / fal JS client / Prisma]
- Check /docs/api for [endpoint] if applicable

Propose your approach before writing code.
```

### Building an API Route
📋
```
Implement #[issue] — [route, e.g. POST /api/generate].

Check /docs/api/[file].md for the spec first.
Use Context7 for [fal client / Stripe / Supabase storage].

Remember: secret key stays server-side, validate input (Zod), enforce limits from constants.ts, structured { error, code } on failure.

Current state: [what exists already]
```

### Building UI / a Component
📋
```
Build #[issue] — [component/section, e.g. SceneGrid + SceneCard].

Use DESIGN.md tokens (dark/gold streetwear, Bebas + DM Sans, sharp 2px radius).
Use Context7 for [Next.js / Tailwind] if needed.

Design intent: [what it should look like / do — reference the draft if relevant]
POC mode — no Phase 2 features.
```

### Debugging Session
📋
```
Debugging #[issue] — [short description].

Error:
[paste error / stack trace]

Failing code:
[paste code or path]

Expected vs. actual:
[what you expected vs. what happened]

Do not change the tests. Fix the implementation.
```

---

## 2. Breaking Down Phase 1 into Issues

📋
```
Break Phase 1 (PRD §4 + §11) into GitHub issues.

For each issue:
- Title
- Owner: ⚡ Claude or 👤 Me (default to Claude if Claude can do it)
- Phase: 1
- Priority
- Description (what + why)
- Acceptance criteria (specific, testable)
- POC notes (deferrals)

Create them all in one batch (gh CLI / GitHub MCP) and add them to the Project board.
```

---

## 3. Creating a Single Issue

📋
```
Create a GitHub issue:

Title: [feature or bug]
Owner: ⚡ Claude / 👤 Me
Phase: 1 / 2
Priority: [Urgent / High / Medium / Low]
Description: [what + why]
Acceptance criteria:
  - [specific, testable]
POC notes: [simplifications / deferrals]
```

---

## 4. Updating API Docs After an Endpoint Change

📋
```
Update /docs/api/[file].md for [endpoint] with this session's changes.

New request shape: [paste]
New response shape: [paste]
New error codes: [list]
```

---

## 5. Asking for an Approach Before Code

📋
```
Before writing code for #[issue], explain your approach for:
- [specific concern, e.g. "how the proof image flows from upload → fal → storage → checkout"]
- [another concern]

Once I confirm, implement it.
```

---

## 6. Session End / Closing an Issue

📋
```
We're done with #[issue]. Close it out:

1. Self-review against acceptance criteria — list anything unmet
2. Verify: no `any`, no inline secrets, no hardcoded prices/limits, inputs validated
3. Run tsc --noEmit, eslint, next build
4. Commit (type(scope): summary — #[issue]), push the branch
5. Open a PR into dev via GitHub MCP
6. Update /docs if endpoints/schema changed
7. Add a completion comment on the issue and list any follow-ups
```

**Commit format:** `type(scope): short description — #<issue>`
Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf` · Scopes: `web`, `api`, `db`, `lib`, `design`, `infra`

---

## 7. Adding a Constant / Business Rule

📋
```
Add to src/constants.ts:

Name: [e.g. MAX_FREE_PROOFS_PER_SESSION]
Value: [e.g. 3]
Purpose: [e.g. "free generations before an order is required"]
Used in: [e.g. /api/generate]

Add it, import it where needed, and replace any hardcoded value.
Commit: chore(api): add [NAME] to constants.ts — #[issue]
```

---

## 8. Database Schema Change

📋
```
Schema change for #[issue].

Proposed change: [new model / column / index]

Before writing the migration:
1. Confirm you've read prisma/schema.prisma and docs/data-model.md
2. Confirm it won't break existing queries
3. Show me the migration + updated model BEFORE applying

Do not apply automatically — show me first.
```

---

## 9. Installing a Dependency

📋
```
I want to add [package] to the app.

Before installing:
- Confirm it's the right tool for [use case]
- Check if something already in the project does this
- Use Context7 to verify the current version + API

If it checks out, install it and update config.
```

---

## 10. When Claude Stops to Ask You

Claude flags and waits when:
- A Prisma schema change is needed (👤 you confirm before applying)
- A new npm package needs installing (👤 you approve)
- Something out of the current issue's scope is discovered mid-session
- A step needs your credentials, a Vercel/Supabase/Stripe/fal/Printful account action, or a manual Printful order

For everything else, Claude proceeds and summarizes at the end.

---

## 11. What You Handle Manually (👤)

| Task | Where |
|------|-------|
| Create accounts + keys (GitHub, Vercel, Supabase, Stripe, fal, Printful) | Their dashboards |
| Set env vars | `.env.local` + Vercel dashboard |
| Connect GitHub MCP | Claude settings |
| Review + merge PRs | GitHub (Claude opens them, you merge) |
| Place the Printful order (Phase 1) | Printful dashboard, from the `/admin` order details |
| Confirm schema changes / package installs | In-session approval |
| Flip Stripe to live keys when ready | Stripe + Vercel env |
| Tag a release | `git tag v0.x -m "..."` then `git push origin main --tags` |

---

*That's My Dawg | POC build*
