---
name: FarmFlow × TDG Flavor — a thin True Digital Group layer over FarmFlow v1
version: 0.3.0 — clean white + split titles, red view-all links, topbar stripe
base: docs/DESIGN-WebAPP-v1.md (FarmFlow "Carbon Precision") — remains the source of truth for everything this file does not mention
applies-to: farmflow-webapp (Next.js 16 · Tailwind v4) — web only
requested-by: Senior Lead — "use the colors and style of https://www.truedigital.com/th/"
switch: <html data-brand="tdg"> — remove the attribute and the site is FarmFlow v1 again
status: Draft for Senior review. TDG gradient stops are approximations (see §9).
---

# FarmFlow × TDG Flavor

> **For Claude Code:** this is a *flavor layer*, not a redesign. FarmFlow v1 stays exactly as it is — layout, sidebar, green identity, charts, ESG, GIS, status colors, density. This file adds a small, named set of True Digital Group traits on top, all switchable with one attribute. If a change you are about to make is not listed in §4–§6, do not make it.
>
> Read `AGENTS.md` first: Next.js 16 has breaking changes; check `node_modules/next/dist/docs/` before touching fonts or the root layout.
>
> **§10 (appended 2026-11-25) records where the shipped code departs from §0–§9 and why. Read it before following any instruction above.**

---

## 0. Hard rules

1. **Additive only.** Do not rename, remove or re-value any FarmFlow v1 token. The flavor overrides a short list of variables under `[data-brand="tdg"]` and adds a few new ones (§4).
2. **One switch.** Every TDG trait must disappear when `data-brand="tdg"` is removed from `<html>`. No TDG hex in components; no component that only looks right in TDG mode.
3. **Green stays FarmFlow.** Forest Green `#004C22` remains the identity for navigation, selection, carbon data, success and charts. TDG Red is for *calls to action and brand moments only*.
4. **Expressive traits only on showcase surfaces** (§6). Dense work screens (tables, forms, PDD Wizard, verifier review) get Level 1 only.
5. **Max one gradient per view.** Gradient text is for one headline keyword or one hero number — never body text, labels, table cells or buttons.
6. **No TDG logo, sub-brand logos, photos or illustrations** copied from truedigital.com. Co-branding ("Powered by True Digital Group") only with written approval from the TDG brand owner.
7. **White stays white — keep FarmFlow clean.** Every surface that is white in v1 (cards, panels, tables, topbar, modals, inputs, hero blocks) stays `#FFFFFF`; the page canvas stays `#F7F8F9`. TDG red appears only as text, buttons, borders and gradient text — never as a background fill, tint, glow or wash. No new background colors, gradients or patterns anywhere.
8. **Accessibility is not traded for style.** Where TDG's own values fail WCAG AA (§8), the accessible variant in this file is used.

---

## 1. What TDG's site actually uses (evidence)

Taken from the saved HTML of `truedigital.com/th` (Nov 2026). Values marked *inferred* come from class names whose CSS was not in the saved file.

| Trait | Evidence in the page | Value |
|---|---|---|
| Brand red | WordPress preset `--wp--preset--color--primary` | `#F11D1D` |
| Body text | `--wp--preset--color--foreground` | `#404040` |
| Grey | `--wp--preset--color--grey` | `#959696` |
| Fonts | computed style on hero text | `Satoshi, "IBM Plex Sans Thai", sans-serif` |
| Headline pattern | `Empowering <span class="tdg-text-gradient-deep-red">Digital Equity</span>` — muted lead-in (`text-neutral-400`, semibold) + gradient keyword | gradient stops *inferred* |
| Gradient variants | `tdg-text-gradient-deep-red / -red / -yellow / -pink` | one per business segment |
| Hero glow | `radial-gradient(at top left, #ff000040, transparent 70%)`; also `#ff1c1c40`, `#ff27b540`, `#5e15dd40` | red/pink/purple at 25% alpha |
| Big stat numbers | `<h1 class="tdg-text-gradient-deep-red">No.1</h1>`, `36 Million` | gradient numeral + small label |
| Hero shape | `rounded-br-[40px] sm:rounded-br-[80px]` | one large rounded corner |
| Cards | `rounded-2xl shadow-md border border-gray-200/50`, hover `shadow-xl -translate-y-1` | 16px radius, lift on hover |
| Eyebrow | `text-primary text-xs font-medium` "TRUE DIGITAL" above card titles | red micro-label |
| Card title | `text-lg font-bold uppercase` | uppercase Latin titles |
| Tabs | pill group `rounded-full p-2 border`, active `bg-primary text-white rounded-full` | red pill active |
| Chip | `tdg-chip` "CONSUMER / ENTERPRISE" on image cards | small label on imagery |
| Sections | `bg-gradient-to-b from-white to-neutral-100`; footer `bg-neutral-100` | soft white→grey bands |
| CTA banner | `rounded-[40px]` with gradient SVG background | very round, gradient |
| Motion | scroll-reveal (`sal.js`, fade/slide 0.5s), parallax (`rellax`), typewriter hero, custom cursor ring | heavy marketing motion |

---

## 2. What we take, and what we leave

| Take ✅ | Why it works for FarmFlow |
|---|---|
| **TDG Red as the CTA color** | The single most recognisable TDG signal; v1 already had a red accent, so this is an upgrade, not a new idea |
| **Satoshi + IBM Plex Sans Thai** | Instantly "feels" TDG; IBM Plex Sans Thai is also excellent for dense Thai UI |
| **Lead-in + gradient-keyword headline** | TDG's signature typographic move; works for page heroes |
| **Gradient hero number** | Fits Flow Decide's "one big metric" perfectly |
| **16px cards with hover lift** (clickable cards only) | Softer, more modern; low risk |
| **Pill tab groups** | Cleaner than underline tabs on showcase pages |
| **Red eyebrow micro-label** | Cheap way to add TDG feel to cards without recoloring them |
| **One big rounded corner** | On the portal chooser and login hero only — shape, not color, so the page stays white |

| Leave ❌ | Why |
|---|---|
| Red active tabs / red selection | Red would then mean "you are here", "do this" *and* "error" — three meanings for one color in a compliance tool |
| Yellow / pink / purple gradients | TDG uses them to color *its own* business segments; in FarmFlow they would read as random |
| Uppercase card titles | Thai has no case; mixed TH/EN cards would look inconsistent |
| Muted grey headline lead-in at `#A3A3A3` | 2.5:1 on white — fails AA (we use a darker grey, §8) |
| Parallax, typewriter, custom cursor, slide-in on every block | Marketing motion; harms a data tool and `prefers-reduced-motion` users |
| TDG logos, sub-brand logos, photography | Brand assets need TDG approval |
| Red/pink radial glows, grey section bands, gradient banners | They tint white surfaces; FarmFlow's clean white is kept instead |

---

## 3. How the switch works

```
<html data-brand="tdg">          ← TDG flavor on
<html>                            ← FarmFlow v1, untouched
```

- FarmFlow v1 tokens stay in `@theme` in `src/app/globals.css` exactly as today.
- Tailwind v4 emits them as CSS variables and utilities read them with `var()`, so overriding the variable under `[data-brand="tdg"]` re-colors every utility that uses it — no component edits for those.
- New tokens (`action`, `brand-red`, gradients…) are added to `@theme` with **v1-equivalent defaults**, so with the flavor off they look exactly like v1.
- Two intensity levels:
  - **Level 1 — everywhere:** fonts, CTA red, card radius/lift, eyebrow.
  - **Level 2 — showcase surfaces only (§6):** gradient headline keyword, gradient hero number, big rounded hero corner, pill tabs. (No glow — §0 rule 7.) Implemented as opt-in classes, so a page never gets them by accident.

---

## 4. Tokens

### 4.1 New tokens (added to `@theme`, v1-equivalent defaults)

| Token | Default (v1 look) | `[data-brand="tdg"]` | Use |
|---|---|---|---|
| `--color-action` | `#004C22` (= primary) | `#D7141A` | Primary CTA button fill |
| `--color-action-hover` | `#003A1A` | `#B5000B` | CTA hover/pressed |
| `--color-on-action` | `#FFFFFF` | `#FFFFFF` | Text on CTA (5.2:1 on `#D7141A`) |
| `--color-brand-red` | `#C8000E` | `#F11D1D` | Graphics only: gradient text, icons, large display (≥ 24px) — never a background |
| `--color-eyebrow` | `#4B5563` | `#D7141A` | Eyebrow micro-label text |
| `--color-lead-in` | `#111827` (= ink, so v1 titles look unchanged) | `#737373` | Muted first half of a split title (4.7:1) |
| `--color-link-cta` | `#004C22` (= primary) | `#D7141A` | "ดูทั้งหมด ›" style navigation links (5.2:1) |
| `--gradient-keyword` | `none` | `linear-gradient(90deg, #FF4040 0%, #F11D1D 45%, #B5000B 100%)` | Gradient headline keyword / hero number |
| `--gradient-keyword-carbon` | `none` | `linear-gradient(90deg, #2E9E63 0%, #1F7A46 50%, #004C22 100%)` | Same pattern for carbon metrics (green version) |
| `--radius-card` | `12px` | `16px` | Clickable cards, KPI cards |
| `--radius-hero` | `12px` | `80px` (40px < 640px) | One corner of a showcase hero |

### 4.2 Existing v1 tokens overridden in TDG mode

| v1 token | v1 value | TDG value | Note |
|---|---|---|---|
| `--color-accent` | `#C8000E` | `#D7141A` | Used in 2 places (notification dot, KPI accent) |
| `--color-accent-hover` | `#A80009` | `#B5000B` | |
| `--color-ink` | `#111827` | `#262626` | Slightly warmer, closer to TDG's neutral greys (15.1:1) |
| `--font-display` | Montserrat + Prompt | Satoshi + IBM Plex Sans Thai | |
| `--font-sans` | Open Sans + Prompt | Satoshi + IBM Plex Sans Thai | |
| `--font-mono` | Inter + Prompt | **unchanged** (Inter, tabular) | Numbers in tables stay as in v1 |

Everything else — `surface`, `panel`, `sunken` (all backgrounds stay as v1: white panels on `#F7F8F9`), `primary*`, `success/warning/error/info`, `chart-*`, `funnel-*`, `esg-*`, `gis-*`, `line*`, `sidebar`, `topbar` — is **not** touched.

### 4.3 Why `#D7141A` and not TDG's `#F11D1D` for buttons
White text on `#F11D1D` is 4.26:1 — fails WCAG AA for normal-size button labels. `#D7141A` is the nearest red that passes (5.24:1) and is visually indistinguishable at button size. `#F11D1D` is still used wherever contrast rules allow it: gradient text, icons and display text ≥ 24px — never as a background.

### 4.4 Red ≠ danger
FarmFlow keeps its own error red (`--color-error: #991B1B`) for danger. To keep "do this" and "something is wrong" apart:
- Destructive buttons are **outline** (`border-error text-error`) with an icon, never filled CTA red, and always behind the confirm dialog.
- Error messages always use `bg-error-bg` + icon + text. A red CTA button never sits inside an error alert.
- Max **one** filled CTA button per view.

---

## 5. Typography

| Role | Font | Weights | Notes |
|---|---|---|---|
| Headings, UI, body | **Satoshi** (Latin) → **IBM Plex Sans Thai** (Thai) | 400 / 500 / 700 (Satoshi) · 400 / 500 / 600 / 700 (Plex Thai) | Same stack TDG uses |
| Numbers, IDs, tables | Inter (unchanged from v1) | 400 / 500 / 600, `tabular-nums` | Keeps v1's aligned numbers |

- **Loading:** IBM Plex Sans Thai via `next/font/google` (subsets `thai`, `latin`). Satoshi is not on Google Fonts — self-host the `.woff2` files from Fontshare with `next/font/local` in `src/app/fonts/`. Check the Satoshi licence on Fontshare before shipping (it is distributed under the ITF Free Font License; confirm it still covers commercial web use).
- Expose them as `--font-satoshi` and `--font-plex-thai`; the TDG override in §4.2 references those variables. Fonts load in both modes (cheap) — only the stack changes.
- Thai line-height stays ≥ 1.6 for body. Satoshi has tighter metrics than Open Sans; check that no table header or button label wraps after the switch.
- **Do not** uppercase Thai or mixed TH/EN titles. Uppercase is allowed only for Latin-only eyebrows (`FLOW DECIDE`, `CARBON`).

### 5.1 Split headline (Level 2)
TDG's signature: a muted lead-in followed by a gradient keyword.

```tsx
<h1 className="text-3xl font-bold">
  <span className="text-lead-in">ภาพรวมคาร์บอน</span>{' '}
  <span className="tdg-gradient-text">Flow Decide</span>
</h1>
```
- Only for page/hero titles on showcase surfaces. One per view.
- The gradient part is ≥ 30px bold (large text — 3:1 rule applies; darkest stops give 7:1).
- In v1 mode `--gradient-keyword` is `none`, so `.tdg-gradient-text` falls back to `color: var(--color-ink)` — the headline still reads correctly.

---

## 6. Components & surfaces

### 6.1 Level 1 — applies everywhere (with the flavor on)

| Component | Change | How |
|---|---|---|
| **Primary CTA buttons** | Green → TDG red | Replace the button pattern `bg-primary … hover:bg-primary-hover` with `bg-action … hover:bg-action-hover text-on-action` **only on buttons that are the main action of a view** (about 37 sites use that pattern; review each). In v1 mode `action` = primary, so nothing changes visually |
| Secondary / ghost buttons | unchanged (green outline / grey) | — |
| Active nav, selected rows, active tabs, checkboxes, focus ring | unchanged (green) | — |
| **Clickable cards** (portal chooser, project cards, KPI cards that link) | `rounded-[var(--radius-card)]`, hover `shadow-lg -translate-y-0.5`, 200ms | Add `.tdg-card-hover` utility; static cards only get the radius |
| **Split page titles** | Every page title `h1` becomes lead-in + keyword (§6.1a) | Wrap words in two spans; color comes from tokens |
| **Red "view all" links** | Navigation links like "ดูทั้งหมด", "ดูรายละเอียด", "ไปที่…" turn TDG red with a `›` chevron (§6.1b) | Add `tdg-link` class only |
| **Topbar brand stripe** | 2px TDG red line on the very top edge of every topbar (§6.1c) | Add `tdg-brand-stripe` class to the topbar root |
| **Eyebrow label** | Small label above card/section titles: `text-xs font-medium text-eyebrow tracking-wide` (e.g. "FLOW VERIFY", "CARBON") | Add where a card already has a category; don't invent labels |
| Fonts | §5 | token switch |

### 6.1a Split page titles (Level 1)
TDG writes titles as a muted lead-in plus a strong keyword ("Empowering **Digital Equity**"). We do the same on every page title, **without** gradient:

```tsx
<h1 className="text-2xl font-semibold text-ink">
  <span className="text-lead-in">จัดการ</span>แปลงเกษตร
</h1>
```
- Lead-in = the verb or generic word (จัดการ, ภาพรวม, คิว, รายงาน); keyword = the object the page is about.
- Same font size and weight for both parts — only the color differs, so line length and wrapping do not change.
- One-word titles stay as they are; do not invent a lead-in or change the wording.
- In v1 mode `--color-lead-in` equals `--color-ink`, so the title looks exactly as before.
- On showcase surfaces (§6.2) the keyword may additionally use `tdg-gradient-text` — that is the only place the gradient appears.

### 6.1b Red "view all" links (Level 1)
TDG ends sections with "learn more ›" / "View all ›". Apply `tdg-link` to **navigation links that take the user to a fuller list or another page** (ดูทั้งหมด, ดูรายละเอียด, ไปที่โครงการ…).
- Not on: links inside sentences, table cell links, sidebar/menu items, breadcrumbs, buttons.
- The chevron is added by CSS only in TDG mode — do not add an icon in JSX.
- In v1 mode the link keeps its current color (`--color-link-cta` = primary) and has no chevron.

### 6.1c Topbar brand stripe (Level 1)
A 2px TDG-red line across the top edge of every topbar (`topbar.tsx`, `business-topbar.tsx` and any other topbar root). Drawn as an inset shadow, so the topbar height and layout do not change. Nothing appears in v1 mode.

### 6.2 Level 2 — showcase surfaces only

| Surface | Route | What it gets |
|---|---|---|
| **Portal chooser** (first screen Mentors see) | `/` | White background as in v1, split headline ("Empowering *Carbon Equity*"-style — copy to be written by the team), portal cards as TDG-style lift cards with eyebrow, big rounded bottom-right corner on the hero block |
| **Login pages** | `/admin/login`, `/verifier/login`, `/business/login` … | One rounded hero corner on the brand panel; colors and form unchanged |
| **Flow Decide** | `/executive` | Split headline in page header; **one** gradient hero number (verified tCO₂e, using `--gradient-keyword-carbon` — green, because it is carbon); pill tab group for period switch (active pill = **green** `bg-primary`) |
| **Public certificate check** | `/verify` | Split headline in the header only |

Not on: Flow Control tables/forms, Flow Verify review screens, PDD Wizard, Business tables, modals, toasts.

### 6.3 Pill tab group (Level 2)
```
container: inline-flex gap-1 p-1 rounded-full border border-line bg-panel
item:      rounded-full px-4 py-1.5 text-sm font-medium text-ink-secondary hover:bg-sunken
active:    bg-primary text-white          ← green, not TDG red (see §2)
```

### 6.4 Gradient hero number (Level 2)
```
value:  text-5xl font-bold font-mono tabular-nums tdg-gradient-text-carbon
label:  text-sm text-ink-secondary   (e.g. "tCO₂e ตรวจรับรองแล้ว")
date:   text-xs text-ink-muted       ("ณ 25 พ.ย. 2569")
```
Estimated (not yet verified) figures **never** get the gradient — they stay plain `text-ink-secondary` with a "ประเมินเบื้องต้น" label.

### 6.5 Motion
Allowed: card hover lift (200ms), one fade-in of the hero block on load (300ms). Everything respects `prefers-reduced-motion: reduce` (no lift, no fade). Not allowed: parallax, typewriter, scroll-reveal on data, custom cursor.

---

## 7. Implementation (for Claude Code)

### 7.1 Branch
`style/tdg-flavor` from `develop`. One PR; it must not touch PR #48/#49 (Treva re-skin) files beyond what is listed here.

### 7.2 `src/app/globals.css` — add to the existing `@theme` (do not edit v1 values)

```css
@theme {
  /* …existing FarmFlow v1 tokens unchanged… */

  /* ── TDG flavor hooks (v1-equivalent defaults) ── */
  --color-action:        #004C22;
  --color-action-hover:  #003A1A;
  --color-on-action:     #FFFFFF;
  --color-brand-red:     #C8000E;
  --color-eyebrow:       #4B5563;
  --color-lead-in:       #111827;
  --color-link-cta:      #004C22;
  --radius-card:         12px;
  --radius-hero:         12px;
}
```

### 7.3 New file `src/styles/tdg-flavor.css` (import it after `tailwindcss` in `globals.css`)

```css
/* FarmFlow × TDG flavor — everything here is scoped to [data-brand="tdg"].
   Remove the attribute on <html> to return to FarmFlow v1. */
:root {
  --gradient-keyword: none;
  --gradient-keyword-carbon: none;
}

[data-brand="tdg"] {
  /* §4.1 new tokens */
  --color-action:       #D7141A;
  --color-action-hover: #B5000B;
  --color-brand-red:    #F11D1D;
  --color-eyebrow:      #D7141A;
  --color-lead-in:      #737373;
  --color-link-cta:     #D7141A;
  --radius-card:        16px;
  --radius-hero:        80px;
  --gradient-keyword:        linear-gradient(90deg, #FF4040 0%, #F11D1D 45%, #B5000B 100%);
  --gradient-keyword-carbon: linear-gradient(90deg, #2E9E63 0%, #1F7A46 50%, #004C22 100%);

  /* §4.2 overrides of v1 tokens */
  --color-accent:       #D7141A;
  --color-accent-hover: #B5000B;
  --color-ink:          #262626;
  /* Backgrounds are deliberately NOT overridden: white stays white (§0 rule 7). */
  --font-display: var(--font-satoshi), var(--font-plex-thai), system-ui, sans-serif;
  --font-sans:    var(--font-satoshi), var(--font-plex-thai), system-ui, -apple-system, sans-serif;
}

@media (max-width: 639px) {
  [data-brand="tdg"] { --radius-hero: 40px; }
}

/* Level 2 utilities — opt-in per element */
.tdg-gradient-text,
.tdg-gradient-text-carbon { color: var(--color-ink); }

[data-brand="tdg"] .tdg-gradient-text,
[data-brand="tdg"] .tdg-gradient-text-carbon {
  background-image: var(--gradient-keyword);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
[data-brand="tdg"] .tdg-gradient-text-carbon { background-image: var(--gradient-keyword-carbon); }

.tdg-hero-corner { border-bottom-right-radius: var(--radius-hero); }

/* §6.1b view-all links: color always from token; chevron only in TDG mode */
.tdg-link { color: var(--color-link-cta); }
[data-brand="tdg"] .tdg-link { font-weight: 500; }
[data-brand="tdg"] .tdg-link::after { content: "\00a0\203A"; transition: margin 150ms ease; }
[data-brand="tdg"] .tdg-link:hover { text-decoration: underline; text-underline-offset: 3px; }

/* §6.1c topbar stripe: inset shadow, no layout impact */
[data-brand="tdg"] .tdg-brand-stripe { box-shadow: inset 0 2px 0 var(--color-brand-red); }

.tdg-card-hover { transition: transform 200ms ease, box-shadow 200ms ease; }
[data-brand="tdg"] .tdg-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.10);
}

@media (prefers-reduced-motion: reduce) {
  .tdg-card-hover, [data-brand="tdg"] .tdg-card-hover:hover { transition: none; transform: none; }
}

@media (forced-colors: active) {
  [data-brand="tdg"] .tdg-gradient-text,
  [data-brand="tdg"] .tdg-gradient-text-carbon { color: CanvasText; background: none; }
}
```

### 7.4 `src/app/layout.tsx`
- Add IBM Plex Sans Thai (`next/font/google`, variable `--font-plex-thai`) and Satoshi (`next/font/local`, files in `src/app/fonts/`, variable `--font-satoshi`) next to the existing v1 fonts. Keep the v1 fonts loaded so turning the flavor off still works.
- Set `<html … data-brand="tdg">` statically. A runtime toggle is out of scope for now; deleting the attribute is the rollback.

### 7.5 Component edits (keep the list short)
1. Page titles → split lead-in/keyword (§6.1a); view-all links → `tdg-link` (§6.1b); topbar roots → `tdg-brand-stripe` (§6.1c).
2. Main-action buttons → `bg-action hover:bg-action-hover text-on-action` (§6.1). Leave secondary, ghost, destructive and nav states alone.
3. Clickable cards → add `tdg-card-hover` and `rounded-[var(--radius-card)]`.
4. Portal chooser, login brand panels, Flow Decide header, `/verify` header → Level 2 classes per §6.2.
5. Never add or change a background class (`bg-white`, `bg-panel`, `bg-surface`, `bg-sunken`, gradients) — backgrounds are out of scope.
6. Nothing else.

### 7.6 Done when
- [ ] With `data-brand="tdg"` removed, screenshots of `/`, `/admin`, `/verifier`, `/executive`, `/business` are pixel-identical to `develop` (except fonts are additionally loaded).
- [ ] With it on: only the items in §6 changed. No green → red anywhere except CTA buttons and the notification/KPI accent.
- [ ] No new hex values in `.tsx` files (`grep -rnE "#[0-9A-Fa-f]{6}" src --include=*.tsx` shows nothing new vs `develop`).
- [ ] At most one filled CTA and one gradient per view.
- [ ] Every surface that is white in v1 is still `#FFFFFF` in TDG mode, and the page canvas is still `#F7F8F9` (check with DevTools on cards, tables, topbar, modals and the portal chooser hero). No red/pink tint anywhere.
- [ ] `npm run build` and `npm run lint` pass; no Thai text overflows in buttons/table headers at 1280px and 375px.
- [ ] PR description has before/after screenshots of the portal chooser, Flow Decide and one dense table page.

---

## 8. Accessibility check (computed, WCAG 2.2)

| Pair | Ratio | Result |
|---|---|---|
| White on `#D7141A` (CTA) | 5.24:1 | ✅ AA |
| White on TDG `#F11D1D` | 4.26:1 | ❌ for normal text → not used for buttons |
| `#D7141A` eyebrow on white | 5.24:1 | ✅ AA |
| `#737373` lead-in on white | 4.74:1 | ✅ AA |
| `#D7141A` view-all link on white | 5.24:1 | ✅ AA |
| TDG's own lead-in `#A3A3A3` on white | 2.52:1 | ❌ → replaced by `#737373` |
| `#262626` ink on white | 15.1:1 | ✅ |
| Gradient stops on white (lightest `#FF4040` / `#2E9E63`) | 3.47 / 3.39:1 | ✅ for large text only (≥ 24px) — which is the only place gradients are allowed |
| `#004C22` primary (unchanged) | 10.2:1 | ✅ |

---

## 9. Open items
- **Exact TDG gradients.** The saved HTML references `tdg-text-gradient-*` classes but not their CSS. The stops in §4.1 are a visual approximation built from TDG's red `#F11D1D`. To match exactly, send `True Digital Group – Empowering Digital Equity_files/style.css` (and `tdg-public.css`) from the saved page folder.
- **Satoshi licence** — confirm on Fontshare before production.
- **Co-branding** — any "Powered by True Digital Group" mark needs TDG brand approval and their official logo files.
- **Senior sign-off** on: red CTA buttons (vs keeping green CTAs and using red only for accents), and the Level 2 surface list.
- **Relationship to Treva:** this flavor is independent of PR #48/#49 (Treva CI re-skin). Pick one direction before merging either; they both touch CTA color and fonts.

---

## 10. Re-base decisions (2026-11-25) — what shipped, and why it differs

§0–§9 above are kept exactly as the Senior Lead approved them. This section records
where the implementation departs, so the two can be read against each other.

The reason for every departure is the same: between v0.3.0 and implementation, the Treva
CI re-skin landed on `develop`. It replaced the flat `@theme` block this document builds on
with a three-layer token system (brand primitives → semantic roles → Tailwind utilities)
and repainted the app in Eggplant / Sea Blue / Moss. §9 said "pick one direction before
merging either"; the decision was to ship **both**, as selectable brands.

### 10.1 Three brands, not one switch

`<html data-brand>` now takes three values instead of being present or absent:

| `data-brand` | Palette | Purpose |
|---|---|---|
| *(unset)* | Treva CI | the real brand — the default everywhere |
| `classic` | FarmFlow v1 | the green palette this document was written against |
| `tdg` | `classic` + the TDG traits | this flavor |

**`tdg` stands on `classic`, not on Treva.** §0 rule 3, §2, §4.4 and §8 all reason about a
green identity, and TDG red only reads as "do this" when the surrounding chrome is not
already carrying a second accent colour. So turning the flavor on also turns the app back
to v1's green, and every rule above remains true as written.

### 10.2 Where the tokens live

§3 and §7.2 describe editing `@theme` directly. That block no longer exists. The equivalent
files are:

| Document says | Code has |
|---|---|
| `@theme { --color-action: #004C22 }` | `src/styles/brand.css` holds the `--v1-*` and `--tdg-*` hex (it is the only file in `src/` allowed to contain hex, per DESIGN.md §0 rule 2) |
| `src/styles/tdg-flavor.css` | `src/styles/brands.css` — all three brands, mapping those primitives onto the Layer-2 semantic roles |
| new `--color-*` with literal defaults | new roles default *through* an existing role (`--action: var(--primary)`), so Treva and classic are unchanged by construction rather than by matching values by hand |

The v1 palette is not retyped from this document — it is copied verbatim from the `@theme`
block the token system replaced (`git show 1514e71:src/app/globals.css`), so `classic` is
v1's palette exactly.

Two mechanical notes for anyone editing `brands.css`:

- It is imported **after** `theme.css`. `:root` and `[data-brand=…]` have the same
  specificity, so the brand overrides win on source order alone.
- `--portal-accent` must be written as `[data-brand=…] [data-portal]`. It is declared on
  `[data-portal]`, a div **inside** `<html>`, and a custom property resolves from the
  nearest ancestor that sets it — a rule on `[data-brand]` alone is silently ignored.

### 10.3 Traits that changed

**§6.1c topbar stripe — dropped, replaced by a recolour.** Treva already draws a 3px bar at
the top edge of every topbar to show which portal you are in. Adding a second 2px red line
at the same edge would stack to 5px. The existing bar is recoloured instead: TDG red under
`tdg`, transparent under `classic` (v1 had no bar). No `tdg-brand-stripe` class exists.

**§6.1a split titles — applied only where the title splits cleanly.** 17 of 40. Thai has no
word spaces, so a compound like *คิวอนุมัติแปลง* can only be split by inserting a space —
changing the copy, which §6.1a forbids — or by breaking the colour mid-compound, which
reads as a rendering bug. One-word titles (Dashboard, Projects, การแจ้งเตือน) and titles
that are data (`{farm.farmName}`) are also left alone. §11 lists every route.

**§6.1 card radius and lift — already true, no edit.** Clickable cards are already
`rounded-2xl` (16px) with `hover:-translate-y-0.5 hover:shadow-md`. Rewriting 72 sites to
`rounded-[var(--radius-card)]` would produce the identical pixels, so `--radius-card` and
`.tdg-card-hover` were not created.

**§5 Satoshi — not shipped.** It is not on Google Fonts, needs self-hosted `.woff2`, and §9
leaves its commercial licence unconfirmed. IBM Plex Sans Thai carries both Latin and Thai in
TDG mode. Swapping Satoshi in later is one line in `brands.css` plus a `next/font/local`
call. Plex is loaded with `preload: false`: all three brands ship in one build, so without
that flag every non-TDG build would carry a preload for a font it never references.

**§7.4 static attribute — now a build-time environment variable.** `data-brand` is read from
`NEXT_PUBLIC_BRAND`, so two Vercel projects can deploy the same branch and differ only by
that variable. Reading a cookie instead would let the brand switch per request, but
`cookies()` in the root layout opts the entire app into dynamic rendering and costs every
statically generated page.

### 10.4 Traits with no surface in this app

Reported rather than forced:

- **§6.1b view-all links** — the app has exactly one ("ดูการแจ้งเตือนทั้งหมด", in the
  notification bell). The other matches are prose or filter pills.
- **§6.3 pill tabs** — Flow Decide has no period tab group; its scope picker is a `<select>`
  plus buttons.
- **§6.1 eyebrow** — one card type carries a category label (the portal cards). The ESG
  section's `E / S / G` labels look like eyebrows but are colour-coded identity; recolouring
  them red would destroy the coding.
- **§6.2 `/verify`** — the public certificate check is at `/verifier/verify/qr-check` and has
  no `<h1>` to split. `/business/login` does not exist; `/business` has no authentication.

### 10.5 Left for the Senior Lead

- **The portal chooser's `<h1>` is the wordmark "FarmFlow"**, not a headline. §6.2 asks for a
  split headline there and notes the copy is still to be written. Applying a TDG red gradient
  to the product's own name edges toward co-branding, which §0 rule 6 reserves for written
  approval, so it was left alone.
- **`classic` is v1's palette, not v1's pixels.** The Treva pass made five semantic decisions
  that CSS cannot undo; they are listed in the pull request.
