# That's My Dawg — Blank Tee & Per-Scene Colors

> Authoritative decision record for **W8 / PRD §13 Q4**: the print blank we sell and
> the shirt color assigned to each launch scene. **This file is the source of truth for
> the W19 seed script** — `Scene.shirtColor` values come from the table below, verbatim.
> Update this file (and re-seed) if the blank or any scene color changes.

---

## 1. The blank

| Field | Value |
|---|---|
| Product | **Men's Oversized Faded T-Shirt** |
| Brand / style | **AS Colour 5082** |
| Fabric | 100% carded cotton, ~7.1 oz, garment-dyed |
| Fit | Boxy oversized, dropped shoulders, wide neck rib |
| Sizes | XS–3XL (covers our entire `SIZES` run `S`–`3XL`) |
| Printful base price | **≈ $23.92 USD** (fulfillment, incl. one-side print) — feeds PRD §13 Q1 |

Chosen because the washed/garment-dyed faded look is on-brand for the dark, editorial
streetwear aesthetic in `DESIGN.md` — it reads as a real apparel drop, not a blank.

**Palette note:** every 5082 color name is prefixed **"Faded …"** and the range has **no
bright white** — the lightest options are *Faded White* (a washed off-white) or *Faded Bone*.
Scene colors must therefore use the exact faded catalog names, not generic labels.

---

## 2. Per-scene colors

`Scene.shirtColor` stores the **exact Printful color name** (operator-accurate for manual
fulfillment, and shown to the customer in the order modal's fixed-color row).

| # | Scene name | `slug` | `shirtColor` (exact) |
|---|------------|--------|----------------------|
| 1 | Bar Dog | `bar-dog` | `Faded Black` |
| 2 | The Therapist | `phd-dog` | `Faded Khaki` |
| 3 | Desert Cowboy | `western` | `Faded Khaki` |
| 4 | Pool Party | `coachella` | `Faded White` |
| 5 | Race Day | `nascar` | `Faded Black` |

**Distinct SKUs:** Faded Black, Faded Khaki, Faded White.

---

## 3. Open verification (👤 at first Printful order — W45)

- Confirm **Faded White** is in Printful's in-stock subset for 5082 in the US region.
  Printful's product page is JS-rendered and didn't expose its exact stocked subset during
  research. If Faded White is unavailable, the recorded fallback for Pool Party is
  **`Faded Bone`** — update §2 and re-seed if so.

---

## 4. Sources

- [Printful — AS Colour 5082 Oversized Faded T-Shirt](https://www.printful.com/custom/mens/t-shirts/oversized-faded-t-shirt-ascolour-5082)
- [AS Colour — Heavy Faded Tee 5082](https://ascolour.com/mens-heavy-faded-tee-5082/)

---

*Decision recorded for #8 (W8). Companion to `PRD.md` §13, `ROADMAP.md` W8/W19, and `docs/data-model.md` (Scene.shirtColor).*
