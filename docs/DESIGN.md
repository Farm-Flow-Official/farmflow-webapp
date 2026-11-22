---
name: Treva — Digital Nature Design System (Web)
version: 1.0.0
supersedes: docs/DESIGN-WebAPP-v1.md (FarmFlow "Carbon Precision" v2.0 — Forest Green / True Red)
status: Provisional CI — colors are final from Business & Marketing; typography is interim (Sarabun) until the full CI Branding Guide ships
scope: Web only — Flow Control (admin), Flow Verify (verifier), Flow Decide (executive), /business, public landing page (TDG sub-domain), ROI pre-calculator, farmer revenue demo
out-of-scope: Flutter mobile app (CI is "For Website Only")
stack: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 (CSS-first @theme) · lucide-react · react-leaflet
tagline: "The path from tree to credit"
---

# Treva Design System — Web (v1.0.0)

> **For Claude Code — read §0 first.** This file is the single source of truth for how the Treva web app looks and behaves. When this file and existing code disagree, this file wins; when this file is silent, follow the nearest existing pattern and flag it.
>
> This repo's `AGENTS.md` applies: Next.js 16 has breaking changes. Before writing layout, font or script code, read the relevant guide in `node_modules/next/dist/docs/`.

---

## 0. Hard rules (MUST / MUST NOT)

These are the rules that make "change one place, the whole site changes" actually true. Break any of them and theming silently stops working.

1. **No raw colors in components.** No hex, `rgb()`, `hsl()`, `oklch()`, Tailwind arbitrary color values (`bg-[#…]`, `text-[#…]`) or Tailwind default palette classes (`bg-green-500`, `text-gray-400`) anywhere under `src/` except the two token files in §3.
2. **Hex values live in exactly one file:** `src/styles/brand.css` (Layer 1). Changing the CI = editing that file only.
3. **Components use semantic utilities only** (`bg-panel`, `text-ink-secondary`, `bg-primary`, `border-line`…). Never reference a Layer 1 primitive (`--treva-sea-700`) from a component.
4. **Never use `dark:` to fix a color.** Semantic tokens already switch with the theme. `dark:` is allowed only for non-color differences (e.g. swapping a map tile URL, an illustration asset).
5. **Mossy Leaf `#618B26` is never body text and never sits under white text.** It is 4.0:1 on white — fails WCAG AA for normal text. Use it for marks, icons, bars, borders and large display numerals (≥ 24px). For carbon text use `text-carbon-ink`.
6. **Pastel Lime `#F5FFD7` is a surface/highlight color, never text on light backgrounds** (1.0:1 on white).
7. **Status is never color-alone.** Every status carries a text label, and an icon where space allows.
8. **Estimated ≠ Verified.** Any carbon figure that has not passed the Verifier Gate must be visually and verbally marked as an estimate (§4.8). This is a business rule, not a style choice.
9. **Thai first for user-facing copy, English for code and technical docs.**
10. **Mark auxiliary chrome now** with `data-chrome="aux"` (§6) so Focus Mode can ship later without touching every page.

---

## 1. Brand & business context

### 1.1 What Treva is
Treva (formerly FarmFlow) is a Carbon FinTech / digital MRV (dMRV) platform that turns trees on Thai smallholder farms into T-VER carbon credits: farmers capture tree data → the system estimates carbon → an accredited verifier checks it → credits are issued and revenue is shared with farmers.

**Brand promise:** *The path from tree to credit* — every number must be traceable back to a tree, a plot and a session.

### 1.2 CI direction (from Business & Marketing)
The CI board presents two directions; Treva uses **Digital Nature, disciplined by Modern Corporate**:

| From **Digital Nature** (selected) | From **Modern Corporate** (as discipline) |
|---|---|
| The 5-color palette | Professional, transparent, enduring (มืออาชีพ โปร่งใส ยั่งยืน) |
| Satellite / layered-data imagery: Earth observation, GIS layers, scan beams | Typography-led layouts, abstract symbols, simple geometric forms |
| Modern, creative, forward-looking (ทันสมัย สร้างสรรค์ ล้ำสมัย) | No literal nature stock imagery (no leaf close-ups, no sunsets over fields) |
| | "Refined, timeless and confident" — premium, institutional, built to last |

**Translation into UI:** nature is expressed through *data about land* (polygons, layers, grids, satellite tiles), not through pictures of plants. The product should feel like an instrument a carbon auditor trusts, with a modern edge that an investor remembers.

### 1.3 Audiences per surface

| Surface | Route(s) | Primary user | What they need from the UI | Density | Device |
|---|---|---|---|---|---|
| **Flow Control** | `/admin` | Treva operations staff | Manage farmers, plots, announcements, settings quickly and without mistakes | High | Desktop first |
| **Flow Verify** | `/verifier`, `/verify` | Accredited external verifier (VVB) | Evidence they can trust: photos, GIS, calculations, audit trail; clear approve/reject | High | Desktop first |
| **Flow Decide** | `/executive` | Executives / partners (TRUE) | Headline numbers, trends, revenue, ESG — at a glance, presentable | Low | Desktop / projector |
| **Business** | `/business` | Business team | Packages, payment records, overview | Medium | Desktop first |
| **Landing page** | TDG sub-domain | Landowners, partners, investors | Understand Treva in 10 seconds, trust it, try the calculator | Low | **Mobile first** |
| **ROI pre-calculator** | public | Landowner farmers | "How much could my land earn?" in plain Thai, honest ranges | Low | **Mobile first** |
| **Farmer revenue demo** | in main web app | Farmers (demo, mock data) | See their trees → carbon → money, with the revenue split shown openly | Low | **Mobile first** |

### 1.4 Business rules the UI must express
- **Verifier Gate** — nothing is a credit until a verifier approves it. Pending/estimated states are always visible as such.
- **Transparency with farmers** — revenue split is shown explicitly wherever farmer money appears. The split is a config value (currently Treva 70 / farmer 30) — never hard-code it in UI copy.
- **No payment gateway** — `/business` shows payment *records* and slip uploads, never a checkout/pay-now flow.
- **Minimal PII** — prefer IDs and masked names in tables; never surface national ID or bank numbers in full.
- **T-VER terminology** — use T-VER/TGO terms consistently (e.g. tCO₂e, Project Boundary, Monitoring Report). Where a term conflicts with T-VER meaning (e.g. "Baseline"), use the T-VER meaning or rename.

---

## 2. Design principles

1. **Trust through traceability.** Every metric can be clicked through to its source (session → plot → tree). Show units, data dates and methodology versions next to numbers.
2. **Calm canvas, meaningful color.** Neutral (Kelp-tinted) surfaces do 90% of the work. Color appears only to say *brand* (Eggplant), *act here* (Sea Blue), *carbon/growth* (Mossy Leaf) or *status*.
3. **Data about land, not pictures of land.** Geometry, layers and maps are the visual language.
4. **Same system, different jobs.** All portals share one component library and one set of tokens; they differ only by a thin portal accent and by density.
5. **Honest numbers.** Estimates look like estimates; ranges beat false precision; mock data is labeled as mock.
6. **Accessible by default.** WCAG 2.2 AA minimum in both light and dark. Every color pair in this document was contrast-checked.

---

## 3. Token architecture — "change one place"

### 3.1 Three layers

```
Layer 1  BRAND PRIMITIVES     src/styles/brand.css
         Raw CI colors + tonal ramps (the ONLY place hex is allowed)
         --treva-eggplant-800: #493657;
                 │
Layer 2  SEMANTIC THEME        src/styles/theme.css
         Role tokens that switch per mode via [data-theme]
         --primary: var(--treva-sea-700);            (light)
         --primary: var(--treva-sea-dark-400);       (dark)
                 │
Layer 3  TAILWIND UTILITIES    src/app/globals.css  (@theme inline)
         --color-primary: var(--primary);   →  bg-primary, text-primary, border-primary
                 │
Components   className="bg-primary text-on-primary"
```

**What changes where**

| Change | Edit | Effect |
|---|---|---|
| CI hex values updated by Marketing | `brand.css` only | Whole site, both modes |
| A role changes (e.g. CTA becomes Eggplant) | one line in `theme.css` | Whole site |
| A new mode (e.g. high-contrast) | add a `[data-theme="…"]` block in `theme.css` | Whole site |
| Portal accent | `[data-portal]` block in `theme.css` | That portal |
| Fonts (when full CI guide arrives) | font loader in `layout.tsx` + `--font-*` in `theme.css` | Whole site |

### 3.2 Naming convention
- Layer 1: `--treva-{hue}-{step}` (`--treva-moss-600`). Dark-tuned extras: `--treva-{hue}-dark-{step}`.
- Layer 2: role names without prefix (`--panel`, `--ink-secondary`, `--primary-hover`).
- Layer 3: `--color-{role}` so Tailwind generates `bg-{role}` / `text-{role}` / `border-{role}`.
- **Existing utility names are kept** (`surface`, `panel`, `sunken`, `line`, `ink-*`, `primary*`, `success*`, `chart-*`, `esg-*`, `gis-*`) so most components re-skin with zero edits. See §15 for the migration map.

Full drop-in CSS for all three layers is in **Appendix A**.

---

## 4. Color

### 4.1 CI palette (Layer 1 anchors)

| Name | Hex | Role in Treva | On white | On Pastel Lime |
|---|---|---|---|---|
| **Dark Eggplant** | `#493657` | Brand identity: sidebar, wordmark, brand headings, Flow Control accent | 10.8:1 ✅ | 10.4:1 ✅ |
| **Pastel Lime** | `#F5FFD7` | Highlight surface, hero backgrounds, active indicator on Eggplant | — (surface) | — |
| **Sea Blue** | `#006992` | **Action**: primary buttons, links, focus ring, selection, info, Flow Verify accent | 6.1:1 ✅ | 5.9:1 ✅ |
| **Mossy Leaf** | `#618B26` | **Carbon / growth**: carbon marks, chart slot 1, success icons, GIS verified | 4.0:1 ⚠️ graphics only | 3.9:1 ⚠️ |
| **Kelp** | `#3F4531` | Neutral family source (text, borders, surfaces are Kelp-tinted), Flow Decide accent | 10.0:1 ✅ | 9.6:1 ✅ |

### 4.2 Tonal ramps (generated in OKLCH from the CI anchors; anchor marked ●)

| Step | Eggplant | Sea | Moss | Kelp (neutral) | Lime |
|---|---|---|---|---|---|
| 50 | `#F8F5FB` | `#EEF9FF` | `#EBFFD8` | `#F6F7F5` | `#F5FFD7` ● |
| 100 | `#F0EDF4` | `#E3F1FA` | `#E2F7CD` | `#EEEFEC` | `#E8F7B8` |
| 200 | `#E1DBE5` | `#CDE2EE` | `#CFE8B7` | `#DDDEDB` | `#D8E6AB` |
| 300 | `#C8C1CF` | `#AAC9DC` | `#B2D094` | `#C3C5C0` | — |
| 400 | `#AAA0B3` | `#7FACC6` | `#8FB268` | `#A3A69F` | — |
| 500 | `#8D8098` | `#538EAF` | `#6D9539` | `#85877F` | — |
| 600 | `#776883` | `#2B779D` | `#618B26` ● | `#6D7066` | — |
| 700 | `#645371` | `#006992` ● | `#466616` | `#595C52` | — |
| 800 | `#493657` ● | `#054B69` | `#344E0C` | `#3F4531` ● | — |
| 900 | `#392845` | `#01354C` | `#233804` | `#2F3228` | — |
| 950 | `#24162E` | `#002030` | `#132200` | `#1C1E16` | — |

Dark-mode tuned extras (lighter, more chroma so they read on dark surfaces):

| Token | Hex | Use |
|---|---|---|
| `--treva-sea-dark-400` | `#66B5E0` | Primary/link in dark (7.8:1 on dark panel) |
| `--treva-sea-dark-300` | `#82C8EF` | Primary hover / info text in dark |
| `--treva-moss-dark-400` | `#94C25D` | Carbon marks in dark |
| `--treva-eggplant-dark-300` | `#BCA2D0` | Brand text in dark |
| `--treva-lime-dark-300` | `#DDF67C` | Active indicator, Decide accent in dark |
| `--treva-eggplant-dark-950` | `#201528` | Sidebar in dark |
| `--treva-eggplant-dark-900` | `#352641` | Sidebar active item in dark |
| Kelp darks | `#090B07` `#0F100B` `#171914` `#21231C` `#202410` `#32342D` `#4C4E46` `#676A61` | Dark surfaces & lines |

### 4.3 Semantic tokens (Layer 2) — light & dark

Contrast is measured against the token's normal background (`panel` unless noted).

**Surfaces**

| Utility | Purpose | Light | Dark |
|---|---|---|---|
| `surface` | Page canvas (behind cards) | Kelp 50 `#F6F7F5` | `#0F100B` |
| `panel` | Cards, tables, inputs, topbar | `#FFFFFF` | `#171914` |
| `raised` | Popovers, menus, modals | `#FFFFFF` (+ shadow) | `#21231C` (+ border) |
| `sunken` | Wells, code, table header, skeleton base | Kelp 100 `#EEEFEC` | `#090B07` |
| `highlight` | Brand-tinted surface: hero, KPI hero, onboarding, "new" | Lime 50 `#F5FFD7` | `#202410` |
| `overlay` | Modal scrim | `rgb(28 30 22 / 0.48)` | `rgb(0 0 0 / 0.64)` |

**Lines**

| Utility | Purpose | Light | Dark |
|---|---|---|---|
| `line` | Dividers, card borders | Kelp 200 `#DDDEDB` | `#32342D` |
| `line-strong` | Table header rule, emphasized borders | Kelp 300 `#C3C5C0` | `#4C4E46` |
| `line-input` | Input/checkbox borders (needs ≥ 3:1) | Kelp 500 `#85877F` (3.6:1) | `#676A61` (3.2:1) |
| `line-focus` / `ring` | Focus ring | Sea 700 `#006992` | `#66B5E0` |

**Text**

| Utility | Purpose | Light | Dark |
|---|---|---|---|
| `ink` | Primary text, data values | Kelp 950 `#1C1E16` (16.8:1) | `#F6F7F5` (16.5:1) |
| `ink-secondary` | Descriptions, labels | Kelp 700 `#595C52` (6.8:1) | `#C3C5C0` (10.2:1) |
| `ink-muted` | Metadata, placeholders, timestamps | Kelp 600 `#6D7066` (5.0:1 ✅) | `#A3A69F` (7.2:1) |
| `ink-disabled` | Disabled text only | Kelp 400 `#A3A69F` | `#5C5F56` |
| `brand` | Brand headings, wordmark, eyebrow labels | Eggplant 800 `#493657` | `#BCA2D0` |

> Upgrade vs v1: the old muted text `#9CA3AF` was 2.5:1 and failed AA. `ink-muted` now passes in both modes, so it may be used for real (if secondary) information.

**Action (Sea Blue)**

| Utility | Purpose | Light | Dark |
|---|---|---|---|
| `primary` | Primary buttons, links, active tab, selected checkbox | Sea 700 `#006992` | `#66B5E0` |
| `primary-hover` | Hover/pressed | Sea 800 `#054B69` | `#82C8EF` |
| `on-primary` | Text/icon on `primary` | `#FFFFFF` (6.1:1) | Kelp 950 `#1C1E16` (7.4:1) |
| `primary-subtle` | Selected row, active nav in light lists, info bg | Sea 50 `#EEF9FF` | `#042838` |
| `primary-muted` | Hover row, chips | Sea 100 `#E3F1FA` | `#0F2230` |

**Carbon (Mossy Leaf)**

| Utility | Purpose | Light | Dark |
|---|---|---|---|
| `carbon` | Carbon marks: bars, sparklines, icons, progress, verified polygons, display numerals ≥ 24px | Moss 600 `#618B26` | `#94C25D` |
| `carbon-ink` | Carbon values as normal-size text ("12.4 tCO₂e") | Moss 700 `#466616` (6.6:1) | Moss 300 `#B2D094` |
| `carbon-subtle` | Carbon chip / card tint | Moss 50 `#EBFFD8` | `#1A2410` |

**Sidebar (Eggplant)**

| Utility | Light | Dark |
|---|---|---|
| `sidebar` (bg) | Eggplant 800 `#493657` | `#201528` |
| `sidebar-ink` (inactive item) | Eggplant 200 `#E1DBE5` (7.9:1) | Eggplant 200 `#E1DBE5` (12.9:1) |
| `sidebar-ink-muted` (section headers) | Eggplant 300 `#C8C1CF` (6.2:1) | Eggplant 400 `#AAA0B3` |
| `sidebar-active` (active item bg) | Eggplant 700 `#645371` | `#352641` |
| `sidebar-indicator` (active bar + active text) | Lime 50 `#F5FFD7` (10.4:1 on Eggplant 800) | `#DDF67C` (14.6:1) |

**Status** — functional colors. Warning and danger are intentionally *outside* the CI palette: a brand palette must not carry alarm meaning, and these hues are reserved so they are never reused for chart series.

| Status | Text (`*`) | Background (`*-bg`) | Light text / bg | Dark text / bg | Contrast (L / D) |
|---|---|---|---|---|---|
| `success` (verified, approved, paid) | ✓ | ✓ | `#466616` / `#EBFFD8` | `#B2D094` / `#1A2410` | 6.2 / 9.5 |
| `warning` (pending, needs attention) | ✓ | ✓ | `#8A5300` / `#FFF6E0` | `#F2B84B` / `#2A2210` | 5.9 / 8.8 |
| `danger` (rejected, flagged, error) | ✓ | ✓ | `#B42318` / `#FEF3F2` | `#F97066` / `#2D1514` | 6.0 / 6.1 |
| `info` (draft, queued, note) | ✓ | ✓ | `#006992` / `#EEF9FF` | `#82C8EF` / `#0F2230` | 5.7 / 8.9 |
| `neutral` (inactive, skipped) | ✓ | ✓ | Kelp 700 / Kelp 100 | `#C3C5C0` / `#21231C` | — |

`danger-solid` (destructive button fill, white text): light `#B42318` (6.6:1), dark `#D92D20` (4.8:1).

### 4.4 Color role guide

| Color | Use for | Never use for |
|---|---|---|
| Eggplant | Sidebar, wordmark, brand headings on marketing pages, Control accent, landing hero blocks | Buttons, links, status, chart series |
| Sea Blue | The single action color: primary button, link, focus, selection, active tab, info | Decoration, large fills, carbon data |
| Mossy Leaf | Anything that *is carbon*: tCO₂e marks, growth, verified polygons, success icon | Body text, under white text, generic "OK" buttons |
| Pastel Lime | Highlight surfaces, hero bg, active indicator on Eggplant, "what's new" | Text on light bg, borders on white (invisible) |
| Kelp | All neutrals (text, borders, canvas) are Kelp-tinted → warm, natural grays | — |

**One primary action per view.** If a screen has two Sea Blue filled buttons, one of them is wrong — demote it to secondary.

### 4.5 Portal accent (thin, identity only)

Each portal root sets `data-portal`; the accent appears **only** as (1) a 3px bar on the top edge of the topbar and (2) the portal-name chip next to the wordmark. Buttons, links and statuses are identical across portals so a user moving between portals never relearns colors.

| `data-portal` | Portal | Light accent | Dark accent |
|---|---|---|---|
| `control` | Flow Control | Eggplant 800 `#493657` | `#BCA2D0` |
| `verify` | Flow Verify | Sea 700 `#006992` | `#66B5E0` |
| `decide` | Flow Decide | Kelp 800 `#3F4531` | Lime `#DDF67C` |
| `business` | Business | Moss 600 `#618B26` | `#94C25D` |
| `public` | Landing / calculator / demo | none (no bar) | none |

Flow Decide pairs Kelp with Lime because Kelp is near-neutral on dark surfaces; the CI board itself pairs these two.

### 4.6 Data visualization

All palettes below were validated with the `dataviz` validator (OKLab ΔE, Machado CVD simulation, all-pairs mode so donut wrap-around is covered).

**Categorical — max 3 slots, in this fixed order**

| Slot | Meaning | Light (on `#FFFFFF`) | Dark (on `#171914`) |
|---|---|---|---|
| `chart-1` | Carbon / primary series | `#618B26` (Moss) | `#6E9E33` |
| `chart-2` | Comparison series | `#006992` (Sea) | `#3A8BC9` |
| `chart-3` | Third series | `#C274A9` (Eggplant family, orchid) | `#A24287` |
| `chart-other` | Everything beyond slot 3, folded | Kelp 400 `#A3A69F` | Kelp `#676A61` |

Results: light — CVD worst all-pairs ΔE 10.2, normal-vision 21.3, all ≥ 3:1. Dark — CVD 10.6, normal-vision 21.9, all ≥ 3:1. **Why only 3:** with the CI's green and blue fixed in slots 1–2, every 4th hue tested either collided under color-blindness (purple ↔ Sea Blue ΔE 1–4; amber ↔ Moss ΔE 1.0) or was a red/amber that would read as a status. More than 3 series → fold into "Other", use small multiples, or use a single-hue bar chart sorted by value.

**Ordinal / sequential (single hue — Moss)** — carbon funnel, tiers, intensity
- Light (low → high): `#8FB268` `#618B26` `#466616` `#233804` ✅
- Dark (low → high): `#466616` `#618B26` `#8FB268` `#B2D094` ✅
- `chart-ghost` (stage exists but has no data yet — outlined, never filled): light Kelp 200 `#DDDEDB`, dark `#32342D`.

**Rules:** one y-axis only; a legend for ≥ 2 series; direct labels on ≤ 4 series; values and labels use `ink` tokens, never the series color; status colors never used as series; every chart has a table view or accessible summary.

**ESG pillars** (navigation encoding; always with name + icon — never color alone)

| Pillar | Text | Bg (light) | Text (dark) | Bg (dark) |
|---|---|---|---|---|
| `esg-e` Environment | Moss 700 `#466616` | Moss 50 `#EBFFD8` | `#B2D094` | `#1A2410` |
| `esg-s` Social | Sea 700 `#006992` | Sea 50 `#EEF9FF` | `#82C8EF` | `#0F2230` |
| `esg-g` Governance | Eggplant 800 `#493657` | Eggplant 50 `#F8F5FB` | `#BCA2D0` | `#24162E` |

### 4.7 GIS / map

| Token | Light | Dark | Use |
|---|---|---|---|
| `gis-verified` | `#618B26` | `#94C25D` | Verified plot/tree |
| `gis-pending` | `#D08A00` | `#F2B84B` | Awaiting verification |
| `gis-flagged` | `#D92D20` | `#F97066` | Anomaly / out of boundary |
| `gis-boundary` | Sea 700 `#006992` | `#66B5E0` | Project boundary outline (dashed) |
| Polygon fill | stroke color at 16% alpha | stroke color at 22% alpha | — |

- Polygons: 2px stroke; selected = 3px + `ring` halo. Status markers use shape + color (● verified, ◆ pending, ▲ flagged) — never color alone.
- **Dark mode:** swap the base tile layer to a dark basemap (the one allowed `dark:`-style asset swap), keep satellite imagery unchanged.
- Always provide a non-map table fallback for screen readers.

### 4.8 Estimated vs Verified (dMRV trust pattern)

| State | Visual | Label (TH / EN) |
|---|---|---|
| Estimated (AI / stub / calculator) | `ink-secondary` value, dashed underline or dashed outline on the card, `~` prefix | "ประเมินเบื้องต้น" / "Estimated" |
| Pending verification | `warning` badge | "รอตรวจรับรอง" / "Pending verification" |
| Verified | `carbon-ink` value, solid `carbon` mark, check icon | "ตรวจรับรองแล้ว" / "Verified" |
| Issued credit | Verified + credit ID (`font-numeric`) | "ออกคาร์บอนเครดิตแล้ว" / "Issued" |

Never sum estimated and verified values into one number without splitting them visually.

---

## 5. Theme modes — Light, Dark, System

### 5.1 Behavior
- Preference values: `light` | `dark` | `system` (default `system`). Stored in `localStorage` key `treva-theme`.
- The **resolved** mode is always written to `<html data-theme="light|dark">`; the preference to `data-theme-pref`. CSS only ever reads `data-theme`.
- When the preference is `system`, listen to `matchMedia('(prefers-color-scheme: dark)')` and update live.
- Set `color-scheme` per mode so native controls and scrollbars match (done in `theme.css`).
- **No flash:** an inline blocking script in `<head>` resolves and sets `data-theme` before first paint (Appendix B). `<html>` gets `suppressHydrationWarning`.
- **Toggle:** a 3-state segmented control (Sun / Moon / Monitor icons, with labels "สว่าง / มืด / ตามระบบ") in the user menu of every portal, and in the footer of public pages.
- Flow Decide may be projected: the presenter's choice wins; never force a mode per portal.

### 5.2 Dark mode rules
- Dark is **designed, not inverted**: each token has its own dark value (§4.3) validated against the dark surface.
- Elevation in dark = lighter surface + 1px `line` border, not bigger shadows.
- Images/photos: no filter. Illustrations and logos: provide light/dark variants (the wordmark switches Eggplant ↔ `#F6F7F5`).
- Charts use their dark slots (§4.6) — never the light hexes on a dark surface.

---

## 6. Focus Mode (reserved — design intent, not yet built)

**Idea:** a toggle that temporarily removes non-essential interface so the user can concentrate on one task (reviewing evidence, filling the PDD Wizard, presenting Flow Decide).

**Contract to reserve now (cheap, do it as components are touched):**
- Mechanism: `<html data-focus="on">`. CSS: `[data-focus="on"] [data-chrome="aux"] { display: none; }`.
- Mark these with `data-chrome="aux"`: announcement banners, notification bell, guide/help links, breadcrumbs, secondary toolbars, SDG strip, footer, non-critical toasts.
- Never mark as aux: primary actions, form fields, validation errors, status badges, data the task needs, the Focus Mode exit control.

**Planned behavior (for a later sprint):** sidebar collapses to a 64px icon rail; topbar shrinks to 48px; content max-width narrows for reading; shortcut `Ctrl/⌘ + .`; an always-visible "ออกจากโหมดโฟกัส" pill; preference stored per user in `treva-focus`. Not persisted across portals by default.

---

## 7. Typography

### 7.1 Font choice (interim)
**Sarabun for everything** until the full CI Branding Guide arrives. Reasons: single family covers Thai + Latin with matched metrics, free on Google Fonts, highly legible in dense tables and forms, wide weight range.

| Token | Value now | Purpose | Will likely change when CI guide ships |
|---|---|---|---|
| `--font-role-sans` → `font-sans` | Sarabun | Body, UI, forms, tables | maybe |
| `--font-role-display` → `font-display` | Sarabun | Headings, hero, KPI | likely (CI candidates: Pridi for premium headings) |
| `--font-role-numeric` → `font-mono` / `.font-numeric` | Sarabun + `tabular-nums` | IDs, tCO₂e, THB, tables | possibly |
| Wordmark | **Ropan** — SVG asset only | "treva" logo | — |

- Load with `next/font/google` (`Sarabun`, subsets `thai` + `latin`, weights 300/400/500/600/700, `display: 'swap'`, CSS variable `--font-sarabun`). Check the Next 16 font docs first.
- **Never load Ropan as a web font** and never type the wordmark in a font — use the SVG from Marketing.
- Not usable on web: Sukhumvit Set (Apple system font, no web license). UID แนนโน๊ะ (handwriting) is reserved for marketing artwork only, never UI. TH Sarabun New is superseded by Sarabun for web.
- Numerals: apply `font-variant-numeric: tabular-nums` on `.font-numeric`. Verify Sarabun honors `tnum` in a table; if it doesn't, point `--font-role-numeric` to a tabular fallback — that is a one-line change in `theme.css`.

### 7.2 Type scale
Thai has stacked vowels and tone marks — line-heights are deliberately generous; never set Thai body below 1.6.

| Style | Size / line-height | Weight | Use |
|---|---|---|---|
| `display-xl` | 48 / 1.2 | 600 | Landing hero (desktop); 34/1.25 on mobile |
| `display` | 30 / 1.3 | 600 | Page title in dashboards, KPI hero number |
| `heading-lg` | 22 / 1.4 | 600 | Section titles |
| `heading-md` | 18 / 1.45 | 600 | Card titles |
| `heading-sm` | 15 / 1.5 | 600 | Sub-sections, table group headers (no uppercase for Thai) |
| `body-lg` | 16 / 1.7 | 400 | Public pages, calculator, farmer demo |
| `body-md` | 14 / 1.65 | 400 | Dashboard default |
| `label` | 13 / 1.5 | 500 | Form labels, column headers |
| `caption` | 12 / 1.5 | 400 | Metadata, footnotes (minimum size anywhere) |
| `numeric-lg` | 28 / 1.2 | 600, tabular | KPI values |
| `numeric` | 14 / 1.4 | 500, tabular | Table numbers, IDs |

Text never smaller than 12px. Form controls are 16px on touch devices (existing iOS zoom fix stays).

### 7.3 Number & unit formatting
- Locale `th-TH` for user-facing pages; Western (Arabic) numerals, not Thai numerals.
- Carbon: `12.40 tCO₂e` (2 decimals; `kgCO₂e` only below 1 t). Money: `฿12,400` or `12,400 บาท` (consistent per surface). Area: `ไร่` (rai) for farmers; hectares only in verifier exports where T-VER requires.
- Dates: `22 พ.ย. 2569` for Thai UI (Buddhist year); ISO `2026-11-22` in exports and audit logs.
- Units sit in `ink-secondary` at a smaller size next to the value.

---

## 8. Space, shape, elevation, layout

### 8.1 Spacing (4/8 grid)
`0.5=2px · 1=4px · 2=8px · 3=12px · 4=16px · 6=24px · 8=32px · 12=48px · 16=64px` (Tailwind default spacing scale — no custom spacing tokens needed).

### 8.2 Radius — geometric, restrained
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Badges, checkboxes, table chips |
| `--radius-md` | 8px | Buttons, inputs, menus |
| `--radius-lg` | 12px | Cards, modals, map container |
| `--radius-xl` | 20px | Landing feature tiles, hero image masks |
| `--radius-full` | 9999px | Avatars, pills, theme toggle |

### 8.3 Elevation
| Token | Light | Dark |
|---|---|---|
| `--elev-sm` → `shadow-sm` | `0 1px 2px rgb(28 30 22 / 0.06)` | none (use `line` border) |
| `--elev-md` → `shadow-md` | `0 4px 12px rgb(28 30 22 / 0.08)` | `0 4px 12px rgb(0 0 0 / 0.4)` + border |
| `--elev-lg` → `shadow-lg` | `0 12px 32px rgb(28 30 22 / 0.12)` | `0 12px 32px rgb(0 0 0 / 0.5)` + border |

Shadows are Kelp-tinted, never pure black, in light mode.

### 8.4 Dashboard shell (Flow Control / Verify / Decide / Business)

```
┌──────────────────────────────────────────────────────────────┐ ← 3px portal accent
│ TOPBAR 64px · panel · border-b line                          │
│ [treva wordmark][Portal chip]   Page title     [Theme][User] │
├─────────────┬────────────────────────────────────────────────┤
│ SIDEBAR     │ CONTENT · surface · padding 32 (24 on tablet)  │
│ 240px       │ max-width 1440 · 12-col grid · 24px gutters     │
│ bg sidebar  │ Page header: title + breadcrumb(aux) + primary │
│             │ action top-right                               │
└─────────────┴────────────────────────────────────────────────┘
```

Sidebar: item height 44px, padding 0 20px; inactive `text-sidebar-ink`; hover `bg-sidebar-active/60`; active `bg-sidebar-active` + 3px left bar `bg-sidebar-indicator` + `text-sidebar-indicator`; section headers 12px `text-sidebar-ink-muted` (no uppercase — Thai has no case).

### 8.5 Breakpoints
| Width | Dashboards | Public pages |
|---|---|---|
| ≥ 1280 | Sidebar 240 fixed | 12-col, max 1200 content |
| 1024–1279 | Sidebar 220 | 12-col |
| 768–1023 | Icon rail 64 + overlay expand | 8-col |
| < 768 | Hidden, hamburger overlay; tables → stacked cards | 4-col, single column, sticky bottom CTA |

Public pages (landing, calculator, farmer demo) are designed at **375px first**; dashboards at 1280px first.

---

## 9. Components

All components read semantic utilities only. Sizes: `sm` 32px, `md` 40px (default), `lg` 48px (public pages / touch).

### 9.1 Buttons
| Variant | Classes (concept) | Use |
|---|---|---|
| **Primary** | `bg-primary text-on-primary hover:bg-primary-hover` | The one main action of the view |
| **Secondary** | `bg-panel text-primary border border-primary/40 hover:bg-primary-subtle` | Supporting actions |
| **Ghost** | `text-ink-secondary hover:bg-sunken` | Toolbar, low-emphasis |
| **Danger** | `bg-danger-solid text-white` | Destructive (always behind a confirm dialog) |
| **Brand** (public only) | `bg-brand text-highlight` (Eggplant + Lime) | Landing hero CTA only — max one per page |

Radius `md`, weight 600, icon 16px with 8px gap. Loading: spinner replaces icon, label stays, button disabled. Disabled: `bg-sunken text-ink-disabled`, no hover. Focus: 2px `ring` + 2px offset (`ring-offset-panel`).

> Change from v1: the True Red CTA is retired. Red now means only danger.

### 9.2 Inputs
Height 40 (48 on public pages). `bg-panel border border-line-input rounded-md text-ink placeholder:text-ink-muted`. Focus: `border-primary` + 2px `ring/30`. Error: `border-danger` + message in `text-danger` with icon, linked via `aria-describedby`. Label above (`label` style), helper text below (`caption`, `ink-muted`). Units as suffix adornment (`ไร่`, `ต้น`, `tCO₂e`).

### 9.3 Cards
`bg-panel border border-line rounded-lg` (+ `shadow-sm` light only). Padding 24 (16 compact). Header: title `heading-md` + optional action. **KPI card:** label `label`/`ink-secondary` → value `numeric-lg` → delta + "as of" date `caption`. Carbon KPIs use the Estimated/Verified pattern (§4.8). **Highlight card:** `bg-highlight` for the one hero metric per page.

### 9.4 Data tables
Container `bg-panel border border-line rounded-lg`. Header `bg-sunken text-ink-secondary label`, bottom `line-strong`. Rows 48px (40 compact), divider `line`, hover `bg-primary-muted/50`, selected `bg-primary-subtle` + 2px left `primary`. Numbers right-aligned, `font-numeric`. Status column uses badges. Sticky header; `aria-sort` on sortable columns; `< 768px` → stacked cards. Empty, loading (5–8 skeleton rows) and error states are mandatory.

### 9.5 Status badges
Height 24, padding 0 10, radius `sm`, 12px/600. `bg-{status}-bg text-{status}` + leading 6px dot or 12px icon. Labels are Thai on Thai pages ("อนุมัติแล้ว", "รอตรวจ", "ถูกปฏิเสธ", "ร่าง", "ปิดใช้งาน").

### 9.6 Navigation
Sidebar per §8.4. Tabs: `text-ink-secondary`, active `text-primary` + 2px bottom `primary`. Breadcrumbs: `caption`, `data-chrome="aux"`.

### 9.7 Topbar
`bg-panel border-b border-line`, 64px, 3px top `bg-portal-accent`. Left: wordmark SVG (20px high) + portal chip (`text-portal-accent border border-portal-accent/40 rounded-full caption`). Right: theme toggle, notification bell (`aux`), role badge, avatar menu.

### 9.8 Modals & dialogs
`bg-raised rounded-lg shadow-lg`, max-width 480 (confirm) / 720 (form). Scrim `bg-overlay`. Focus trap, `role="dialog"`, `aria-modal`, `aria-labelledby`, Esc closes (except unsaved forms → confirm). Destructive confirm: title states the consequence; confirm button is Danger with the verb ("ลบแปลงนี้"), cancel is Ghost and focused by default.

### 9.9 Alerts, banners, toasts
Inline alert: `bg-{status}-bg border border-{status}/30 text-ink` + `text-{status}` icon. Announcement banner: `bg-highlight text-ink`, dismissible, `aux`. Toasts: bottom-right (bottom-center on mobile), `bg-raised shadow-md`, 4s auto-dismiss except errors (persist until dismissed); max 3 stacked.

### 9.10 Loading & empty states
Skeleton: `bg-sunken` with shimmer of `line` (respect reduced motion → static). Empty state: 32px outline icon `ink-muted`, title `heading-sm`/`ink-secondary`, one line of guidance, optional secondary button. Error state: what happened + what to do + retry.

### 9.11 Map panel
Container `rounded-lg border border-line overflow-hidden`. Legend card top-right (`bg-raised/90`, shape + color + label). Layer toggle (Satellite / Map / Boundary). Tables fallback below on small screens.

### 9.12 Evidence viewer (Flow Verify)
Split view: evidence (photo, GIS, measurements) left, decision panel right (sticky). Show capture metadata (time, GPS accuracy, device) as `caption`. AI/stub results always labeled "ประเมินเบื้องต้น" with confidence. Approve = Primary, Reject = Secondary-danger (`text-danger border-danger/40`) that requires a reason.

### 9.13 Wizard (PDD Wizard)
Stepper top (numbered, completed = `carbon` check, current = `primary`, upcoming = `line-strong`), one section per step, sticky footer with Back (Ghost) / Save draft (Secondary) / Next (Primary). Autosave indicator `caption`. Prime Focus Mode candidate.

### 9.14 Icons
lucide-react, 1.75px stroke, 16px in dense UI / 20px default / 24px public. Icons inherit `currentColor`. Decorative icons `aria-hidden`.

---

## 10. Surface guidelines

### 10.1 Flow Control (`/admin`) — accent Eggplant
Operational, dense, fast. Defaults: compact tables, bulk actions, keyboard shortcuts. Primary task of each page is the top-right Primary button. Settings pages use Secondary actions + explicit Save.

### 10.2 Flow Verify (`/verifier`) — accent Sea Blue
The verifier is an external auditor: prioritize evidence and auditability over aesthetics. Every decision shows who/when/why in an audit trail. Downloadable PDF report is the prominent action on report pages. Never show farmer PII beyond what T-VER verification needs.

### 10.3 Flow Decide (`/executive`) — accent Kelp / Lime
Presentation-grade. Max 4 KPI cards on the first view, one `bg-highlight` hero metric (e.g. verified tCO₂e), at most 2 charts above the fold, ESG pillars by name + icon. Large numerals, generous whitespace, "as of" dates on every metric. Looks right projected in light mode and on a laptop in dark mode.

### 10.4 Business (`/business`) — accent Moss
Packages, payment records, overview. No checkout or "pay now" — payments are records with slip upload and status. Money values `font-numeric`, right-aligned.

### 10.5 Landing page (TDG sub-domain) — public, mobile first
The most "Digital Nature" surface.
- Hero: `bg-brand` (Eggplant) or `bg-highlight` (Lime) block, `display-xl` headline in Thai, tagline "The path from tree to credit", one Brand CTA → ROI calculator, one Secondary CTA → contact.
- Imagery: satellite/Earth-observation renders, layered GIS planes, scan beams, polygon grids. Abstract geometric patterns (grid lines, contour lines, hexagon tiling) at low opacity on Eggplant. **No** stock photos of leaves, hands holding seedlings, or sunsets.
- Sections: problem → how it works (Snap → Sync → Sustain, 3 steps with geometric icons) → trust (T-VER, verifier, TRUE partnership) → calculator CTA → FAQ.
- Light/dark both supported; hero colors switch via tokens.

### 10.6 ROI pre-calculator — public, mobile first
- Audience: landowner farmers, possibly on low-end Android phones. Inputs: area (ไร่), tree species (searchable list), tree count/age. Big inputs (48px), Thai labels, units visible.
- Output: a **range** (low–high), never a single promise. Show: estimated tCO₂e/year → estimated value at an assumed carbon price → farmer's share using the configured split. Assumptions (carbon price, split, years) visible and editable in an "สมมติฐาน" expandable.
- Mandatory disclaimer under the result (`caption`, `ink-secondary`): estimates only; actual credits depend on T-VER verification, survival rate and market price.
- Result card uses the Estimated style (§4.8). CTA: "ติดต่อทีม Treva" (Primary).

### 10.7 Farmer revenue demo — in main web app, mobile first
- Persistent badge "ข้อมูลตัวอย่าง (Demo)" (`warning` style) at the top — mock data must never be mistakable for real money.
- Story: my plots → my trees → carbon (estimated vs verified) → revenue → **my share**, with the split drawn as a simple two-segment bar labeled in text (Treva / เกษตรกร).
- Plain language, large numbers, one idea per screen. Reverse view of Flow Decide (executive revenue) — reuse its data components, not its density.

---

## 11. Imagery & graphic language
- **Motifs:** satellite tiles, stacked translucent data layers, polygon outlines, survey grids, contour lines, scan beams, simple geometric marks.
- **Treatment:** imagery in hero/marketing only; dashboards use maps and charts as their imagery. Overlays use `brand` or `highlight` at 60–85% opacity; text over images must still meet 4.5:1.
- **Illustrations:** flat geometric, 2-tone from the palette (Eggplant + Lime, or Sea + Moss), no gradients except subtle layer fades.
- **Logo:** "treva" wordmark (Ropan) — Eggplant on light, `#F6F7F5` or Lime on dark/Eggplant. Clear space = height of the "t". Min height 20px. Don't recolor outside these, don't stretch, don't place on busy imagery without a solid block.

---

## 12. Motion
| Token | Value | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `--duration-fast` | 120ms | Hover, row highlight |
| `--duration-base` | 200ms | Menus, tabs, modal enter |
| `--duration-slow` | 320ms | Page sections on landing page |

Theme switch: no animated color transition on the whole page (avoid flashing); only the toggle animates. Landing page may use gentle fade/translate-in on scroll; dashboards never animate data cells. `prefers-reduced-motion: reduce` → durations 0, skeleton static, keep the nav progress bar visible but still.

---

## 13. Accessibility (WCAG 2.2 AA, both modes)
- Text ≥ 4.5:1 (≥ 3:1 for ≥ 24px or ≥ 19px bold); UI component boundaries and graphics ≥ 3:1. All pairs in §4 meet this; any new pair must be checked before merge.
- Visible focus on every interactive element (`ring`, 2px + offset); never `outline: none` without replacement.
- Target size ≥ 24×24 (dashboards), ≥ 44×44 (public mobile pages).
- Forms: labels always visible, errors in text and linked by `aria-describedby`.
- Tables: `<th scope>`, `aria-sort`; maps and charts have table/text alternatives.
- `lang="th"` on Thai pages, `lang="en"` on English fragments for correct screen-reader voice.
- Respect `prefers-reduced-motion`; support Windows forced-colors (status icons/shapes still carry meaning).

---

## 14. UX writing
- Thai first, polite and plain (ครับ/ค่ะ are not needed in UI labels). Verbs on buttons ("บันทึก", "ส่งตรวจ", "ดาวน์โหลดรายงาน"), not "ตกลง" when a specific verb exists.
- Name things the way T-VER/TGO names them; keep one Thai term per concept across portals (maintain a glossary in `docs/`).
- Numbers come with units and dates. Estimates say so. Errors say what happened and what to do.
- Product names: **Treva** (UI text), "treva" (logo only), portals "Flow Control / Flow Verify / Flow Decide" in English.

---

## 15. Migration from FarmFlow v1 (for Claude Code)

Work in this order; each phase is shippable on its own and keeps the app working.

### Phase 1 — Tokens (re-skin without touching components)
1. Create `src/styles/brand.css` and `src/styles/theme.css` from Appendix A.
2. Replace the `@theme` block in `src/app/globals.css` with the `@theme inline` mapping in Appendix A (keep the existing base styles, iOS zoom fix and keyframes).
3. Swap fonts in `src/app/layout.tsx`: remove Montserrat / Open Sans / Inter / Prompt, add Sarabun (`--font-sarabun`).
4. Add `data-portal` on each portal's root layout (`admin` → `control`, `verifier` → `verify`, `executive` → `decide`, `business` → `business`).

**Old → new token map**

| v1 utility / value | v1 meaning | v1.0.0 Treva |
|---|---|---|
| `primary` `#004C22` (as sidebar bg) | brand green | `sidebar` (Eggplant) |
| `primary` (as button/link/focus) | green | `primary` (Sea Blue) — same name, new value |
| `primary-subtle` / `primary-muted` | green tints | Sea tints (same names) |
| `accent` `#C8000E` (CTA) | True Red | **`primary`** — remove `accent`; alias it to `primary` during migration only |
| `accent` (critical alert) | red | `danger` |
| `surface` / `panel` / `sunken` | grays | same names, Kelp-tinted |
| `line` / `line-strong` | borders | same names; inputs → `line-input` |
| `line-focus` | green focus | `line-focus` / `ring` (Sea) |
| `ink*` | gray text | same names, Kelp-tinted (muted now passes AA) |
| `success*` / `warning*` / `error*` / `info*` | status | `success*` / `warning*` / `danger*` (rename `error` → `danger`, keep `error` alias during migration) / `info*` |
| `chart-1..5` | 5-slot categorical | `chart-1..3` + `chart-other` (slots 4–5 fold into other) |
| `funnel-1..3` | green ordinal | `funnel-1..4` (Moss ordinal) |
| `esg-*` | green/blue/amber | Moss/Sea/Eggplant (same names) |
| `gis-*` | green/red/amber | same names, new values + `gis-boundary` |
| `bg-white` | card | `bg-panel` |

### Phase 2 — Remove hard-coded colors
- Find offenders: `grep -rnE "#[0-9A-Fa-f]{3,8}\b|\[(#|rgb|hsl)|\b(bg|text|border|ring|fill|stroke)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]{2,3})?\b" src --include=*.tsx --include=*.ts --include=*.css | grep -v "src/styles/brand.css"`
- Replace each with the semantic utility. Leaflet/SVG/canvas colors read tokens at runtime: `getComputedStyle(document.documentElement).getPropertyValue('--gis-verified')` (re-read on theme change).
- Sidebar components → `bg-sidebar`, `text-sidebar-ink`, etc.

### Phase 3 — Dark mode
- Add the no-flash script and theme provider/toggle (Appendix B).
- Audit every page in dark: maps (dark basemap), charts (dark slots), images, logos, PDF previews.

### Phase 4 — Lock it
- Uncomment `--color-*: initial;` in `@theme inline` so Tailwind's default palette no longer exists (re-declare only `white`, `black` if needed). Default-palette classes then generate nothing and are caught in review.
- Add the Phase 2 grep as `npm run lint:colors` and run it in CI; fail on any match.
- Start tagging `data-chrome="aux"` (§6).

### Done when
- [ ] Changing one hex in `brand.css` visibly changes every portal in both modes.
- [ ] `lint:colors` returns zero matches.
- [ ] Every page checked in light, dark and system mode, at 375 / 768 / 1280px.
- [ ] No text pair below 4.5:1 (axe or Lighthouse a11y ≥ 95 on key pages).
- [ ] True Red no longer appears anywhere; red appears only for danger.
- [ ] Estimated vs Verified pattern used everywhere carbon values appear.

---

## 16. Open items (waiting on the full CI Branding Guide)
- Final typefaces (display, body, numeric) — Sarabun is interim; tokens make this a one-place change.
- Wordmark SVG files (light, dark, on-Eggplant variants) and favicon/app icon in Ropan.
- Official imagery set (satellite/data-layer renders) and pattern library.
- Whether Marketing wants a CI-approved warning/danger hue (current values are functional choices).
- Whether `/business` should keep Moss as its portal accent.

---

## Appendix A — Token files (drop-in)

### A.1 `src/styles/brand.css` — Layer 1 (only file with hex)

```css
/* Treva CI primitives. Source: "Direction for TREVA (For Website Only)".
   Ramps generated in OKLCH from the CI anchors (marked ●).
   Edit HERE to change the brand everywhere. Never reference these from components. */
:root {
  /* Dark Eggplant ● 800 */
  --treva-eggplant-50:  #F8F5FB;  --treva-eggplant-100: #F0EDF4;
  --treva-eggplant-200: #E1DBE5;  --treva-eggplant-300: #C8C1CF;
  --treva-eggplant-400: #AAA0B3;  --treva-eggplant-500: #8D8098;
  --treva-eggplant-600: #776883;  --treva-eggplant-700: #645371;
  --treva-eggplant-800: #493657;  --treva-eggplant-900: #392845;
  --treva-eggplant-950: #24162E;
  --treva-eggplant-dark-300: #BCA2D0;
  --treva-eggplant-dark-900: #352641;
  --treva-eggplant-dark-950: #201528;

  /* Sea Blue ● 700 */
  --treva-sea-50:  #EEF9FF;  --treva-sea-100: #E3F1FA;
  --treva-sea-200: #CDE2EE;  --treva-sea-300: #AAC9DC;
  --treva-sea-400: #7FACC6;  --treva-sea-500: #538EAF;
  --treva-sea-600: #2B779D;  --treva-sea-700: #006992;
  --treva-sea-800: #054B69;  --treva-sea-900: #01354C;
  --treva-sea-950: #002030;
  --treva-sea-dark-300: #82C8EF;
  --treva-sea-dark-400: #66B5E0;
  --treva-sea-dark-subtle: #042838;
  --treva-sea-dark-muted:  #0F2230;

  /* Mossy Leaf ● 600 */
  --treva-moss-50:  #EBFFD8;  --treva-moss-100: #E2F7CD;
  --treva-moss-200: #CFE8B7;  --treva-moss-300: #B2D094;
  --treva-moss-400: #8FB268;  --treva-moss-500: #6D9539;
  --treva-moss-600: #618B26;  --treva-moss-700: #466616;
  --treva-moss-800: #344E0C;  --treva-moss-900: #233804;
  --treva-moss-950: #132200;
  --treva-moss-dark-400: #94C25D;
  --treva-moss-dark-subtle: #1A2410;

  /* Kelp ● 800 — neutral family */
  --treva-kelp-50:  #F6F7F5;  --treva-kelp-100: #EEEFEC;
  --treva-kelp-200: #DDDEDB;  --treva-kelp-300: #C3C5C0;
  --treva-kelp-400: #A3A69F;  --treva-kelp-500: #85877F;
  --treva-kelp-600: #6D7066;  --treva-kelp-700: #595C52;
  --treva-kelp-800: #3F4531;  --treva-kelp-900: #2F3228;
  --treva-kelp-950: #1C1E16;
  --treva-kelp-dark-sunken:  #090B07;
  --treva-kelp-dark-canvas:  #0F100B;
  --treva-kelp-dark-panel:   #171914;
  --treva-kelp-dark-raised:  #21231C;
  --treva-kelp-dark-line:    #32342D;
  --treva-kelp-dark-line-2:  #4C4E46;
  --treva-kelp-dark-input:   #676A61;
  --treva-kelp-dark-disabled:#5C5F56;

  /* Pastel Lime ● 50 */
  --treva-lime-50:  #F5FFD7;  --treva-lime-100: #E8F7B8;
  --treva-lime-200: #D8E6AB;
  --treva-lime-dark-300: #DDF67C;
  --treva-lime-dark-surface: #202410;

  /* Functional status (not CI) */
  --treva-amber-700: #8A5300;  --treva-amber-50:  #FFF6E0;
  --treva-amber-600: #D08A00;  --treva-amber-dark-300: #F2B84B;
  --treva-amber-dark-bg: #2A2210;
  --treva-red-700: #B42318;    --treva-red-50: #FEF3F2;
  --treva-red-600: #D92D20;    --treva-red-dark-300: #F97066;
  --treva-red-dark-bg: #2D1514;

  /* Chart-only hues (validated, see DESIGN.md §4.6) */
  --treva-chart-orchid: #C274A9;
  --treva-chart-dark-moss: #6E9E33;
  --treva-chart-dark-sea:  #3A8BC9;
  --treva-chart-dark-orchid: #A24287;

  /* Absolute */
  --treva-white: #FFFFFF;
  --treva-black: #000000;
}
```

### A.2 `src/styles/theme.css` — Layer 2 (semantic, per mode)

```css
/* Semantic roles. Components never read --treva-* directly. */
:root,
[data-theme="light"] {
  color-scheme: light;

  /* Surfaces */
  --surface:   var(--treva-kelp-50);
  --panel:     var(--treva-white);
  --raised:    var(--treva-white);
  --sunken:    var(--treva-kelp-100);
  --highlight: var(--treva-lime-50);
  --overlay:   rgb(28 30 22 / 0.48);

  /* Lines */
  --line:        var(--treva-kelp-200);
  --line-strong: var(--treva-kelp-300);
  --line-input:  var(--treva-kelp-500);
  --ring:        var(--treva-sea-700);

  /* Text */
  --ink:           var(--treva-kelp-950);
  --ink-secondary: var(--treva-kelp-700);
  --ink-muted:     var(--treva-kelp-600);
  --ink-disabled:  var(--treva-kelp-400);
  --brand:         var(--treva-eggplant-800);

  /* Action */
  --primary:        var(--treva-sea-700);
  --primary-hover:  var(--treva-sea-800);
  --on-primary:     var(--treva-white);
  --primary-subtle: var(--treva-sea-50);
  --primary-muted:  var(--treva-sea-100);

  /* Carbon */
  --carbon:        var(--treva-moss-600);
  --carbon-ink:    var(--treva-moss-700);
  --carbon-subtle: var(--treva-moss-50);

  /* Sidebar */
  --sidebar:           var(--treva-eggplant-800);
  --sidebar-ink:       var(--treva-eggplant-200);
  --sidebar-ink-muted: var(--treva-eggplant-300);
  --sidebar-active:    var(--treva-eggplant-700);
  --sidebar-indicator: var(--treva-lime-50);

  /* Status */
  --success: var(--treva-moss-700);   --success-bg: var(--treva-moss-50);
  --warning: var(--treva-amber-700);  --warning-bg: var(--treva-amber-50);
  --danger:  var(--treva-red-700);    --danger-bg:  var(--treva-red-50);
  --danger-solid: var(--treva-red-700);
  --info:    var(--treva-sea-700);    --info-bg:    var(--treva-sea-50);
  --neutral: var(--treva-kelp-700);   --neutral-bg: var(--treva-kelp-100);

  /* Charts */
  --chart-1: var(--treva-moss-600);
  --chart-2: var(--treva-sea-700);
  --chart-3: var(--treva-chart-orchid);
  --chart-other: var(--treva-kelp-400);
  --chart-ghost: var(--treva-kelp-200);
  --funnel-1: var(--treva-moss-400);
  --funnel-2: var(--treva-moss-600);
  --funnel-3: var(--treva-moss-700);
  --funnel-4: var(--treva-moss-900);

  /* ESG */
  --esg-e: var(--treva-moss-700);     --esg-e-bg: var(--treva-moss-50);
  --esg-s: var(--treva-sea-700);      --esg-s-bg: var(--treva-sea-50);
  --esg-g: var(--treva-eggplant-800); --esg-g-bg: var(--treva-eggplant-50);

  /* GIS */
  --gis-verified: var(--treva-moss-600);
  --gis-pending:  var(--treva-amber-600);
  --gis-flagged:  var(--treva-red-600);
  --gis-boundary: var(--treva-sea-700);

  /* Portal accent (overridden by [data-portal]) */
  --portal-accent: transparent;

  /* Elevation */
  --elev-sm: 0 1px 2px rgb(28 30 22 / 0.06);
  --elev-md: 0 4px 12px rgb(28 30 22 / 0.08);
  --elev-lg: 0 12px 32px rgb(28 30 22 / 0.12);
}

[data-theme="dark"] {
  color-scheme: dark;

  --surface:   var(--treva-kelp-dark-canvas);
  --panel:     var(--treva-kelp-dark-panel);
  --raised:    var(--treva-kelp-dark-raised);
  --sunken:    var(--treva-kelp-dark-sunken);
  --highlight: var(--treva-lime-dark-surface);
  --overlay:   rgb(0 0 0 / 0.64);

  --line:        var(--treva-kelp-dark-line);
  --line-strong: var(--treva-kelp-dark-line-2);
  --line-input:  var(--treva-kelp-dark-input);
  --ring:        var(--treva-sea-dark-400);

  --ink:           var(--treva-kelp-50);
  --ink-secondary: var(--treva-kelp-300);
  --ink-muted:     var(--treva-kelp-400);
  --ink-disabled:  var(--treva-kelp-dark-disabled);
  --brand:         var(--treva-eggplant-dark-300);

  --primary:        var(--treva-sea-dark-400);
  --primary-hover:  var(--treva-sea-dark-300);
  --on-primary:     var(--treva-kelp-950);
  --primary-subtle: var(--treva-sea-dark-subtle);
  --primary-muted:  var(--treva-sea-dark-muted);

  --carbon:        var(--treva-moss-dark-400);
  --carbon-ink:    var(--treva-moss-300);
  --carbon-subtle: var(--treva-moss-dark-subtle);

  --sidebar:           var(--treva-eggplant-dark-950);
  --sidebar-ink:       var(--treva-eggplant-200);
  --sidebar-ink-muted: var(--treva-eggplant-400);
  --sidebar-active:    var(--treva-eggplant-dark-900);
  --sidebar-indicator: var(--treva-lime-dark-300);

  --success: var(--treva-moss-300);        --success-bg: var(--treva-moss-dark-subtle);
  --warning: var(--treva-amber-dark-300);  --warning-bg: var(--treva-amber-dark-bg);
  --danger:  var(--treva-red-dark-300);    --danger-bg:  var(--treva-red-dark-bg);
  --danger-solid: var(--treva-red-600);
  --info:    var(--treva-sea-dark-300);    --info-bg:    var(--treva-sea-dark-muted);
  --neutral: var(--treva-kelp-300);        --neutral-bg: var(--treva-kelp-dark-raised);

  --chart-1: var(--treva-chart-dark-moss);
  --chart-2: var(--treva-chart-dark-sea);
  --chart-3: var(--treva-chart-dark-orchid);
  --chart-other: var(--treva-kelp-dark-input);
  --chart-ghost: var(--treva-kelp-dark-line);
  --funnel-1: var(--treva-moss-700);
  --funnel-2: var(--treva-moss-600);
  --funnel-3: var(--treva-moss-400);
  --funnel-4: var(--treva-moss-300);

  --esg-e: var(--treva-moss-300);           --esg-e-bg: var(--treva-moss-dark-subtle);
  --esg-s: var(--treva-sea-dark-300);       --esg-s-bg: var(--treva-sea-dark-muted);
  --esg-g: var(--treva-eggplant-dark-300);  --esg-g-bg: var(--treva-eggplant-950);

  --gis-verified: var(--treva-moss-dark-400);
  --gis-pending:  var(--treva-amber-dark-300);
  --gis-flagged:  var(--treva-red-dark-300);
  --gis-boundary: var(--treva-sea-dark-400);

  --elev-sm: none;
  --elev-md: 0 4px 12px rgb(0 0 0 / 0.4);
  --elev-lg: 0 12px 32px rgb(0 0 0 / 0.5);
}

/* Portal accents (thin identity only — see DESIGN.md §4.5) */
[data-portal="control"]  { --portal-accent: var(--treva-eggplant-800); }
[data-portal="verify"]   { --portal-accent: var(--treva-sea-700); }
[data-portal="decide"]   { --portal-accent: var(--treva-kelp-800); }
[data-portal="business"] { --portal-accent: var(--treva-moss-600); }
[data-theme="dark"] [data-portal="control"],  [data-theme="dark"][data-portal="control"]  { --portal-accent: var(--treva-eggplant-dark-300); }
[data-theme="dark"] [data-portal="verify"],   [data-theme="dark"][data-portal="verify"]   { --portal-accent: var(--treva-sea-dark-400); }
[data-theme="dark"] [data-portal="decide"],   [data-theme="dark"][data-portal="decide"]   { --portal-accent: var(--treva-lime-dark-300); }
[data-theme="dark"] [data-portal="business"], [data-theme="dark"][data-portal="business"] { --portal-accent: var(--treva-moss-dark-400); }

/* Typography roles (one-place font swap) */
:root {
  --font-role-sans:    var(--font-sarabun), system-ui, -apple-system, sans-serif;
  --font-role-display: var(--font-sarabun), system-ui, -apple-system, sans-serif;
  --font-role-numeric: var(--font-sarabun), system-ui, -apple-system, sans-serif;
}

/* Focus Mode hook (reserved — DESIGN.md §6) */
[data-focus="on"] [data-chrome="aux"] { display: none !important; }
```

### A.3 `src/app/globals.css` — Layer 3 (Tailwind v4 mapping)

```css
@import "tailwindcss";
@import "../styles/brand.css";
@import "../styles/theme.css";

/* dark: variant follows data-theme, not the OS media query (for the rare non-color case) */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* `inline` makes utilities emit var(--token), so they follow the active theme at runtime */
@theme inline {
  /* Phase 4: uncomment to delete Tailwind's default palette entirely */
  /* --color-*: initial; */

  --color-surface: var(--surface);
  --color-panel: var(--panel);
  --color-raised: var(--raised);
  --color-sunken: var(--sunken);
  --color-highlight: var(--highlight);
  --color-overlay: var(--overlay);

  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-line-input: var(--line-input);
  --color-line-focus: var(--ring);
  --color-ring: var(--ring);

  --color-ink: var(--ink);
  --color-ink-secondary: var(--ink-secondary);
  --color-ink-muted: var(--ink-muted);
  --color-ink-disabled: var(--ink-disabled);
  --color-brand: var(--brand);

  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-on-primary: var(--on-primary);
  --color-primary-subtle: var(--primary-subtle);
  --color-primary-muted: var(--primary-muted);

  --color-carbon: var(--carbon);
  --color-carbon-ink: var(--carbon-ink);
  --color-carbon-subtle: var(--carbon-subtle);

  --color-sidebar: var(--sidebar);
  --color-sidebar-ink: var(--sidebar-ink);
  --color-sidebar-ink-muted: var(--sidebar-ink-muted);
  --color-sidebar-active: var(--sidebar-active);
  --color-sidebar-indicator: var(--sidebar-indicator);

  --color-success: var(--success);   --color-success-bg: var(--success-bg);
  --color-warning: var(--warning);   --color-warning-bg: var(--warning-bg);
  --color-danger: var(--danger);     --color-danger-bg: var(--danger-bg);
  --color-danger-solid: var(--danger-solid);
  --color-info: var(--info);         --color-info-bg: var(--info-bg);
  --color-neutral: var(--neutral);   --color-neutral-bg: var(--neutral-bg);

  /* Migration aliases — delete in Phase 4 */
  --color-accent: var(--primary);
  --color-accent-hover: var(--primary-hover);
  --color-error: var(--danger);
  --color-error-bg: var(--danger-bg);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-other: var(--chart-other);
  --color-chart-ghost: var(--chart-ghost);
  --color-funnel-1: var(--funnel-1);
  --color-funnel-2: var(--funnel-2);
  --color-funnel-3: var(--funnel-3);
  --color-funnel-4: var(--funnel-4);

  --color-esg-e: var(--esg-e);  --color-esg-e-bg: var(--esg-e-bg);
  --color-esg-s: var(--esg-s);  --color-esg-s-bg: var(--esg-s-bg);
  --color-esg-g: var(--esg-g);  --color-esg-g-bg: var(--esg-g-bg);

  --color-gis-verified: var(--gis-verified);
  --color-gis-pending: var(--gis-pending);
  --color-gis-flagged: var(--gis-flagged);
  --color-gis-boundary: var(--gis-boundary);

  --color-portal-accent: var(--portal-accent);

  --color-white: var(--treva-white);
  --color-black: var(--treva-black);

  --font-sans: var(--font-role-sans);
  --font-display: var(--font-role-display);
  --font-mono: var(--font-role-numeric); /* existing `font-mono` usages = numeric data */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;

  --shadow-sm: var(--elev-sm);
  --shadow-md: var(--elev-md);
  --shadow-lg: var(--elev-lg);

  --sidebar-width: 240px;
  --topbar-height: 64px;
}

body {
  background-color: var(--surface);
  color: var(--ink);
  font-family: var(--font-role-sans);
}
h1, h2, h3 { font-family: var(--font-role-display); }
.font-numeric, .font-mono { font-variant-numeric: tabular-nums; }
```

> Layer 2 font and elevation roles are named `--font-role-*` and `--elev-*` on purpose: Tailwind's own `--font-sans` / `--shadow-*` theme variables would otherwise reference themselves.

---

## Appendix B — Theme runtime (no flash, 3-state)

**Inline head script** (render in the root layout `<head>`; check Next 16 docs for the current recommended way to inject a blocking inline script):

```js
(function () {
  try {
    var pref = localStorage.getItem('treva-theme') || 'system';
    var dark = pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var el = document.documentElement;
    el.setAttribute('data-theme', dark ? 'dark' : 'light');
    el.setAttribute('data-theme-pref', pref);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
```

**Client hook contract** (`src/hooks/use-theme.ts`):
- `const { pref, resolved, setPref } = useTheme()`; `pref ∈ 'light'|'dark'|'system'`.
- `setPref` writes `localStorage['treva-theme']`, updates `data-theme` + `data-theme-pref`, and dispatches a `treva:themechange` event (maps/charts listen and re-read CSS variables).
- While `pref === 'system'`, subscribe to `matchMedia('(prefers-color-scheme: dark)')` changes.
- All storage access wrapped in try/catch (private mode).

**Reading tokens in JS** (Leaflet, canvas, chart libs):

```ts
export const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
// token('gis-verified') → '#618B26' (light) / '#94C25D' (dark)
```

---

## Changelog
- **1.0.0 (2026-11-22)** — Treva rebrand. Replaces FarmFlow v2.0 (Forest Green + True Red). New CI palette (Eggplant / Pastel Lime / Sea Blue / Mossy Leaf / Kelp), 3-layer token architecture, light/dark/system modes, portal accents, Focus Mode contract, Sarabun interim typography, Estimated-vs-Verified pattern, CVD-validated chart palette, migration plan.
