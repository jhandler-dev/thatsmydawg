# That's My Dawg — Branching, CI/CD & Sync Workflow

> Shared reference for the **developer ↔ Claude** loop: how code moves from a feature
> branch → `dev` → `main`, what's automated vs. manual, the sync rules that keep local /
> remote / deploys aligned, and what to tell Claude at each step.
>
> Legend: ⚡ Claude does this · 👤 You do this manually.

---

## 1. The big picture

```
main   ── production (Vercel production deploy, tagged at releases)
  ▲
  │  PR (dev → main) + tag        👤 you
  │
dev    ── integration (Vercel preview)
  ▲
  │  PR (feature → dev) + merge   ⚡ Claude opens · 👤 you merge
  │
feature/<issue#>-<slug>  ── one branch per GitHub issue, cut from dev
```

- **`main`** = production. **`dev`** = integration. **`feature/*`** = one per issue, branched off `dev`.
- Code path: **feature branch → PR → merge to `dev` → (later) PR → merge to `main`.**
- 🚫 Never commit or push directly to `dev` or `main`. Everything goes through a branch + PR. (Branch protection is by convention.)

---

## 2. Automated vs. manual

| Thing | Status | Notes |
|---|---|---|
| **Vercel deploys** | 🚀 Auto by branch/PR | `main` → **production**; every PR (incl. `dev`) → its own **preview URL**. No manual deploy. |
| **Pre-merge checks** (`tsc --noEmit`, `next build`, eslint) | 🧑‍💻 Convention, run by ⚡ Claude locally before each PR | No enforced CI gate on the free tier; the local checks Claude runs are the de-facto CI. (A GitHub Actions check can be added later.) |
| **DB migrations** | 🧑‍💻 Run explicitly | `npx prisma migrate dev` locally; `prisma migrate deploy` against the hosted DB. 👤 You confirm any schema change first. |
| **Env vars** | 👤 Manual | Set in `.env.local` (dev) and in the Vercel dashboard (preview/production). Never committed. |

**Environments:**
- Local: `http://localhost:3000`, your `.env.local`, your dev Supabase + Stripe **test** keys.
- Preview (`dev` / PRs): Vercel preview URL.
- Production (`main`): Vercel production URL, production keys (Stripe **live** only when you're ready).

---

## 3. Standard feature loop

| # | Step | Who | Detail |
|---|---|---|---|
| 1 | **Start** | ⚡ | `git checkout dev && git pull origin dev`, then `git checkout -b feature/<issue#>-<slug>`. |
| 2 | **Build** | ⚡ | Implement; run `tsc --noEmit`, eslint, `next build`. |
| 3 | **PR** | ⚡ | Push `-u`, open a PR **into `dev`** via GitHub MCP, referencing the issue. |
| 4 | **Merge** | 👤 | Review the preview deploy, then **merge the PR on GitHub**. |
| 5 | **Sync** | ⚡ | Tell Claude **"merged #N"** → Claude does `git checkout dev && git pull origin dev`, deletes the merged branch, confirms a clean in-sync tree. |
| 6 | **Verify** | 👤 | Check the `dev` preview deploy. |

> ### ⚠️ Always sync after a feature → `dev` merge
> **Every time** a feature PR merges into `dev`, immediately tell Claude **"merged #N"**.
> Claude then runs, without exception: `git checkout dev` → `git pull origin dev` → delete the merged branch → confirm clean + in sync.
> Skipping it leaves local `dev` behind, so the next work starts from **stale code**.

---

## 4. Promote to production (release)

| # | Step | Who |
|---|---|---|
| 1 | Say **"promote dev → main"** / "cut a release" | 👤 |
| 2 | Open the `dev → main` PR | ⚡ |
| 3 | **Merge it, then tag** `v0.<phase>.<patch>` and `git push origin main --tags` | 👤 |
| 4 | Vercel redeploys production from `main` automatically | 🚀 |

Tags are the rollback handle — don't skip them. Claude opens PRs into `dev`, **not** `main` (a hotfix branched from `main` is the only exception; PR it back to `main`, then back-merge to `dev`).

---

## 5. Gotchas

- **Pull after every merge, before building.** A merged PR does not update local `dev`. Always `git checkout dev && git pull origin dev` first.
- **Env vars must exist in Vercel too.** A feature that reads a new env var will work locally but break in preview/production until you add it in the Vercel dashboard. Tell Claude when you add one.
- **Stripe test vs. live.** Use **test** keys + the Stripe CLI for local webhook testing until you're truly ready for live. Don't flip to live keys casually.
- **Schema changes are gated.** Claude shows the migration before applying; you confirm. Never auto-migrate production.

---

## 6. What to tell Claude (cheat sheet)

| Moment | Say this |
|---|---|
| Starting a feature | "Branch off dev for #N" + anything broken / to be careful of |
| Ready to ship | "Open a PR into dev for #N" |
| After you merge on GitHub | **"Merged #N"** (so Claude pulls dev, deletes the branch, re-syncs) |
| Releasing | "Promote dev → main" (Claude opens the PR; you merge + tag) |
| Added an env var | "I added `FOO` in Vercel" (so Claude knows it's available) |

---

## 7. Branch naming

```
feature/<issue#>-<slug>    # feature tied to a GitHub issue
fix/<issue#>-<slug>        # bug fix
hotfix/<slug>              # urgent fix from main, PR'd back to main, then back-merged to dev
chore/<slug>              # tooling/config with no issue
```

---

*Companion to `CLAUDE.md` §8 (git workflow) and `PRD.md`. Update when the branch model, CI, or deploy mapping changes.*
