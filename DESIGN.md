# That's My Dawg — Design System & Visual Language

> Living reference for all visual decisions. Derived from the website draft (`thatsmydawg_Website_Draft.html`).
> Read alongside `PRD.md` (what to build) and `CLAUDE.md` (how to build it).
> Update this file whenever a token or pattern is added, changed, or deprecated.

---

## 1. Design Philosophy

**"Premium streetwear, not a pet-merch gimmick."**

The product is a customer's actual dog dropped into a hand-designed scene. The design has to feel like a real apparel drop — bold, confident, a little irreverent — so the personalization reads as *cool*, not novelty-store. The aesthetic is **dark, gold-accented, editorial streetwear**.

Every decision should pass this test: *does this look like a streetwear label's drop page, or like a generic print-your-photo site?* Always the former.

### Tone in copy
- Punchy, lowercase-friendly, streetwear voice. Short lines. Confident.
- Scene blurbs lean into the joke: "Cap on backwards, beer in paw, dive bar of their dreams."
- Uppercase, wide-tracked microcopy for labels, CTAs, eyebrows.
- Error messages still explain what happened and what to do next.

---

## 2. Color System

Defined as design tokens (Tailwind theme / CSS variables). Never inline hex — reference the token name.

| Token | Hex | Role |
|---|---|---|
| `black` | `#080808` | Page background — the canvas everything sits on |
| `offblack` | `#111111` | Slightly lifted background sections |
| `charcoal` | `#181818` | Card / scene-tile background |
| `cream` | `#f0ead8` | Primary body text on dark |
| `bone` | `#d9cfb8` | Secondary / muted text |
| `gold` | `#c9a84c` | The signature accent — CTAs, prices, eyebrows, active states |
| `gold2` | `#e8c96a` | Gold hover / highlight |
| `white` | `#ffffff` | Headlines, logo, max-contrast text |
| `red` | `#c0392b` | Errors, sold-out / destructive states |

### Usage rules
- **Gold is the personality color.** Use it for primary CTAs, prices, eyebrows, badges, active step numbers, and key hovers. Don't dilute it by using it for body text.
- **Charcoal for cards.** Scene tiles and modal surfaces sit on `charcoal` against the `black` page so they lift.
- **Cream/bone for text.** `cream` for primary copy on dark; `bone` (or cream at reduced opacity) for secondary. The draft uses `rgba(240,234,216,.55)` for muted subtext — keep that pattern.
- **Red is rare.** Only errors and destructive/unavailable states.
- **Dark theme only** in POC — there is no light mode.

---

## 3. Typography

Three families, loaded from Google Fonts (as in the draft):

| Family | Use |
|---|---|
| **Bebas Neue** | Display — hero title, scene names, step numbers, logo. Tall, condensed, all-caps energy. |
| **DM Sans** (300/400/500/600) | Body, UI, labels, descriptions. The workhorse. |
| **Playfair Display** (700/900, italic) | Editorial serif accent — occasional emphasis/quotes. Use sparingly. |

### Scale & patterns (from the draft)
- **Hero title:** Bebas Neue, `clamp(5rem, 14vw, 11rem)`, `line-height: .9`, `letter-spacing: .03em`, color `white`.
- **Hero subtext:** DM Sans 300, `clamp(.95rem, 2vw, 1.15rem)`, muted cream (`rgba(240,234,216,.55)`), `line-height: 1.65`, max-width ~480px.
- **Eyebrow / microcopy:** DM Sans 500, ~`.7rem`, `letter-spacing: .28em`, `text-transform: uppercase`, color `gold`.
- **Section titles:** Bebas Neue, large, white.
- **Price:** DM Sans 600, `gold`.
- **Body / descriptions:** DM Sans 300–400, `cream`/`bone`.

Rule: **all-caps + wide tracking** is the brand's signature for any label, CTA, eyebrow, or badge. Headlines are Bebas; running text is DM Sans.

---

## 4. Spacing & Shape

- **Sharp, not rounded.** Border radius is minimal — buttons and CTAs use `border-radius: 2px`, upload zones `4px`. This keeps the streetwear/editorial edge. Avoid soft, friendly rounding.
- **Generous vertical rhythm.** Hero is ~92vh; sections breathe.
- **Base spacing:** 8px-ish grid; section padding is roomy (the draft uses `2.5rem`+ horizontal padding on nav, large section gaps).
- **Minimum touch target:** 44px on interactive elements (mobile web).

---

## 5. Component Patterns (from the draft)

### Nav
Fixed, translucent dark (`rgba(8,8,8,.94)` + `backdrop-filter: blur(14px)`), thin gold-tint bottom border. Logo in Bebas with a `gold` span accent. Links: uppercase, tracked, muted cream → gold on hover. CTA button (gold).

### Ticker
Full-width `gold` bar under the nav, black uppercase tracked text scrolling left — a streetwear "marquee" detail. Keep it.

### Hero
Centered, ~92vh. Radial gold glow background (`radial-gradient(... rgba(201,168,76,.07) ...)`). Eyebrow (gold) → giant Bebas title → muted subline → button row. Fade-up entrance animations.

### Buttons
- **Primary / CTA:** `gold` background, `black` text, uppercase, `font-weight: 600`, `letter-spacing: .1em`, `border-radius: 2px`. Hover → `gold2`. (`.btn`: padding `.85rem 2.2rem`; `.nav-cta`: tighter.)
- **Secondary:** outlined / ghost on dark (thin gold-tint border, cream text) for lower-priority actions.

### Scene card (`.shirt-card`)
`charcoal` background, image fills, overflow hidden, pointer cursor. On the card: scene name (Bebas), short description (DM Sans muted), price (gold), optional badge. Hover lift/zoom is on-brand. This is the heart of the grid.

### Badge
Small uppercase tracked label ("Best Seller", "New Drop", "Fan Fave") in gold or gold-outline — sits on the scene card.

### Step number (how-it-works)
52px circle, thin gold-tint border, Bebas numeral. Active step uses solid gold.

### Upload zone (`.upload`)
Dashed gold-tint border (`1.5px dashed rgba(201,168,76,.28)`), `border-radius: 4px`, centered icon + prompt text, hover state. This is where the dog photo goes.

### Modal (order flow)
Full-screen dark scrim (`rgba(0,0,0,.88)`), centered panel on `charcoal`. Contains: header/subtitle, image area (proof + loading spinner + status text), form (upload zone, size selection, price row, fine print), and a success state. This is the upload → proof → size → checkout container.

### Toast & spinner
Toast for transient feedback; spinner + status copy for the generation wait (generation can take several seconds — the loading state must feel intentional, see §6).

### Reviews / FAQ / Footer
Static in POC. Footer: Bebas logo, link columns, copyright. FAQ: simple expandable list.

---

## 6. Motion

The draft uses `fadeUp` entrance animations (hero eyebrow/title/subline/buttons stagger by ~.1–.3s) and a scrolling ticker. Principles:
- **Deliberate, not frantic.** Entrances fade-and-rise; hovers are quick (~.2s).
- **The generation wait is the one long moment** — give it a designed spinner + rotating status copy so the multi-second AI call feels like anticipation, not lag.
- Respect `prefers-reduced-motion`.

---

## 7. Implementation Notes (Next.js + Tailwind)

- Map every token in §2 to the Tailwind theme (`tailwind.config`) and/or CSS variables in the root layout; load the three Google Fonts via `next/font`.
- Build the storefront sections from the draft as React components: `Nav`, `Ticker`, `Hero`, `SceneGrid` + `SceneCard`, `HowItWorks`, `Reviews`, `FAQ`, `Footer`, and the `OrderModal` (upload → proof → size → checkout).
- The draft is the **visual reference**, not the architecture — its client-side fal key flow and inline `SHIRTS` array are replaced by `/api/generate` and `Scene` DB records.
- Keep `border-radius` small, type all-caps for labels, and gold as the single accent. When in doubt, look at the draft.

---

## 8. What Not To Do

- **No inline hex** — use tokens.
- **No soft/rounded "friendly" look** — this is sharp streetwear; minimal radius.
- **No gold overuse** — accent only; body text stays cream/bone.
- **No light mode** in POC.
- **No undesigned loading/empty states** — especially the generation wait.
- **No mixing in a fourth font** — Bebas / DM Sans / Playfair only.

---

*Last updated: foundation draft | That's My Dawg | POC*
