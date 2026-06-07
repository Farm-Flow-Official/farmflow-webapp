---
name: FarmFlow — Carbon Precision
version: 2.0
context: Back-office Admin Dashboard & External Verifier Portal
platform: Web Application (Desktop primary · Tablet supported)
colors:
  # --- Base Layers ---
  background:          '#FFFFFF'
  surface:             '#F7F8F9'
  surface-raised:      '#FFFFFF'
  surface-sunken:      '#F0F2F4'
  surface-overlay:     'rgba(255, 255, 255, 0.92)'

  # --- Borders & Dividers ---
  border-default:      '#E4E7EB'
  border-strong:       '#C9CDD3'
  border-focus:        '#004C22'

  # --- Text ---
  text-primary:        '#111827'
  text-secondary:      '#4B5563'
  text-tertiary:       '#9CA3AF'
  text-on-dark:        '#FFFFFF'
  text-disabled:       '#D1D5DB'

  # --- Brand Primary: Deep Forest Green ---
  primary:             '#004C22'
  primary-hover:       '#003A1A'
  primary-subtle:      '#F0FFF4'
  primary-muted:       '#D1FAE5'
  primary-container:   '#166534'
  on-primary:          '#FFFFFF'

  # --- Brand Accent: True Red (CTA only) ---
  accent:              '#C8000E'
  accent-hover:        '#A80009'
  accent-subtle:       '#FFF5F5'
  on-accent:           '#FFFFFF'

  # --- Semantic States ---
  success:             '#166534'
  success-bg:          '#F0FFF4'
  warning:             '#92400E'
  warning-bg:          '#FFFBEB'
  error:               '#991B1B'
  error-bg:            '#FEF2F2'
  info:                '#1E40AF'
  info-bg:             '#EFF6FF'

  # --- GIS Map Palette ---
  gis-verified:        '#22C55E'
  gis-flagged:         '#EF4444'
  gis-pending:         '#F59E0B'
  gis-polygon-fill:    'rgba(34, 197, 94, 0.12)'
  gis-polygon-stroke:  '#16A34A'

  # --- Data Visualization ---
  chart-primary:       '#004C22'
  chart-secondary:     '#16A34A'
  chart-tertiary:      '#86EFAC'
  chart-neutral:       '#D1D5DB'

typography:
  # Font roles:
  #   Montserrat → main headings (display, heading-*)
  #   Open Sans  → body content (body-*, label, caption)
  #   Inter      → important numeric data (KPI values, IDs, THB / kgCO₂e)
  #   Prompt     → Thai-language content (applied via :lang(th) / Thai glyph ranges)
  # Fallback stack: system-ui, -apple-system, sans-serif
  font-family-display: '"Montserrat", system-ui, -apple-system, sans-serif'
  font-family-body:    '"Open Sans", system-ui, -apple-system, sans-serif'
  font-family-numeric: '"Inter", system-ui, -apple-system, sans-serif'
  font-family-thai:    '"Prompt", system-ui, -apple-system, sans-serif'

  display:
    fontFamily: '"Montserrat", system-ui, sans-serif'
    fontSize:   28px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: '-0.02em'
    color: text-primary

  heading-lg:
    fontFamily: '"Montserrat", system-ui, sans-serif'
    fontSize:   22px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '-0.01em'

  heading-md:
    fontFamily: '"Montserrat", system-ui, sans-serif'
    fontSize:   18px
    fontWeight: '600'
    lineHeight: '1.4'

  heading-sm:
    fontFamily: '"Montserrat", system-ui, sans-serif'
    fontSize:   15px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0.01em'
    textTransform: 'uppercase'

  body-lg:
    fontFamily: '"Open Sans", system-ui, sans-serif'
    fontSize:   16px
    fontWeight: '400'
    lineHeight: '1.65'

  body-md:
    fontFamily: '"Open Sans", system-ui, sans-serif'
    fontSize:   14px
    fontWeight: '400'
    lineHeight: '1.65'

  label:
    fontFamily: '"Open Sans", system-ui, sans-serif'
    fontSize:   13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0.01em'

  caption:
    fontFamily: '"Open Sans", system-ui, sans-serif'
    fontSize:   12px
    fontWeight: '400'
    lineHeight: '1.5'
    color: text-secondary

  numeric:
    fontFamily: '"Inter", system-ui, sans-serif'
    fontVariantNumeric: 'tabular-nums'
    fontSize:   14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '-0.01em'

  thai:
    fontFamily: '"Prompt", system-ui, sans-serif'
    # Use for all Thai-language UI copy; pairs with the sizes/weights above

spacing:
  # 8-point grid system
  unit:          8px
  xs:            4px
  sm:            8px
  md:            16px
  lg:            24px
  xl:            32px
  2xl:           48px
  3xl:           64px
  touch-target:  44px
  row-height-sm: 48px
  row-height-md: 56px
  page-max-width: 1440px
  sidebar-width:  240px
  content-padding: 32px

rounded:
  sm:    4px
  md:    6px
  lg:    8px
  xl:    12px
  2xl:   16px
  full:  9999px

elevation:
  card:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
  panel:   '0 4px 12px rgba(0,0,0,0.06)'
  modal:   '0 16px 48px rgba(0,0,0,0.12)'
  dropdown:'0 8px 24px rgba(0,0,0,0.08)'
---

---

## 1. Design Philosophy

FarmFlow's back-office system is a **professional enterprise tool** used by internal administrators and certified external verifiers. The visual design must reflect **institutional credibility** — the kind of trust that financial regulators and carbon credit auditors require.

### Core Principles

**1. White as the Foundation**
The interface is predominantly white (`#FFFFFF`) and near-white (`#F7F8F9`). Color is used economically — only to convey meaning, status, or priority. This approach reduces cognitive fatigue during long work sessions and ensures data grids, maps, and document previews have maximum visual clarity.

**2. Green as Identity, Not Decoration**
Deep Forest Green (`#004C22`) appears in navigation, focus states, active indicators, and verified status badges. It is the brand anchor — present but disciplined. It should never be used as a fill on large content areas.

**3. Red Reserved for Action and Urgency**
True Red (`#C8000E`) is reserved exclusively for: the primary CTA button, critical alerts, GIS flagged polygons, and anomaly indicators. Its visual weight must remain rare and meaningful.

**4. Data Density with Breathing Room**
This is a data-heavy B2B system. Components must handle dense information without feeling cramped. Achieve this through generous line-height, disciplined column widths, and clear typographic hierarchy — not through reducing content.

**5. Institutional Legibility**
Every element is optimized for professional office conditions (high-resolution screens, ambient lighting). Inter with tabular figures for IDs and numeric data. High-contrast text ratios (minimum WCAG AA, target AAA for critical fields).

---

## 2. Layout System

### Shell Structure

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR (64px fixed)                                │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │  PAGE CONTENT                        │
│  (240px      │  (max-width 1440px, padded 32px)    │
│   fixed)     │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Topbar (64px)

- Background: `#FFFFFF`, bottom border: `1px solid #E4E7EB`
- Left: FarmFlow logo + wordmark (monochrome, 20px height)
- Center: Page title (heading-md, text-primary)
- Right: Role badge pill + avatar with dropdown (name, logout)
- Subdomain indicator: small label below logo — "Admin Dashboard" or "Verifier Portal" in text-tertiary

### Sidebar (240px)

- Background: `#004C22` (Deep Forest Green)
- Text: `rgba(255,255,255,0.75)` for inactive items
- Active item: white text + `rgba(255,255,255,0.12)` fill + 3px left border accent in white
- Hover: `rgba(255,255,255,0.08)` fill
- Section headers: 11px uppercase, `rgba(255,255,255,0.45)`, letter-spacing 0.08em
- Nav item height: 44px, padding: 0 20px
- Bottom: version tag in caption style

### Page Content

- Background: `#F7F8F9`
- Padding: 32px on all sides
- Page header zone: page title (display) + breadcrumb (caption) + primary action button — always top-right aligned
- Content body: 12-column grid with 24px gutters

---

## 3. Color Application Guide

### When to use each color

| Color | Use Case | Never Use For |
|-------|----------|--------------|
| `#004C22` Primary | Sidebar bg, active states, focus rings, verified badges, secondary buttons | Background fills in content area, decorative elements |
| `#C8000E` Accent | Primary CTA buttons, critical alert backgrounds, GIS flagged polygons | Secondary actions, informational states, large areas |
| `#F7F8F9` Surface | Page background, table row alternates (subtle) | Cards (use white), modals (use white) |
| `#FFFFFF` White | Cards, panels, modals, table backgrounds, input fields | Page backgrounds (use surface instead) |
| `#111827` Text Primary | Headings, data values, important labels | Secondary context text |
| `#4B5563` Text Secondary | Descriptions, timestamps, helper text | Primary data values |
| `#9CA3AF` Text Tertiary | Placeholders, empty states, metadata | Data that requires user attention |

### Status Color Application

| Status | Background | Text | Border | Usage |
|--------|-----------|------|--------|-------|
| Active / Verified | `#F0FFF4` | `#166534` | `#BBF7D0` | Account status, approved batches |
| Pending | `#FFFBEB` | `#92400E` | `#FDE68A` | KYC pending, awaiting review |
| Rejected / Flagged | `#FEF2F2` | `#991B1B` | `#FECACA` | Rejected payouts, anomalies |
| Paid | `#EFF6FF` | `#1E40AF` | `#BFDBFE` | Completed payout transfers |

---

## 4. Component Specifications

### 4.1 Buttons

#### Primary CTA — "Capture Action" (Red)
```
background:    #C8000E
color:         #FFFFFF
height:        44px
padding:       0 24px
border-radius: 6px
font:          14px, weight 600
hover:         background #A80009, transform: translateY(-1px)
active:        background #8C0008
focus:         outline 2px solid #C8000E, offset 2px
```
Reserved for: Approve, Confirm Payment, Submit Verification, Save Settings

#### Secondary Action — "Navigate / Support" (Green)
```
background:    #004C22
color:         #FFFFFF
height:        44px
padding:       0 20px
border-radius: 6px
font:          14px, weight 500
hover:         background #003A1A
```
Reserved for: Export PDF, View on Map, secondary page actions

#### Tertiary / Ghost
```
background:    transparent
border:        1px solid #E4E7EB
color:         #4B5563
height:        44px
padding:       0 20px
border-radius: 6px
hover:         background #F7F8F9, border-color #C9CDD3
```
Reserved for: Cancel, Clear Filter, secondary actions in modals

#### Danger (Destructive)
```
background:    transparent
border:        1px solid #FECACA
color:         #991B1B
height:        44px
padding:       0 20px
border-radius: 6px
hover:         background #FEF2F2
```
Reserved for: Reject, Delete (requires confirmation dialog)

---

### 4.2 Input Fields

All input fields use a **clean bordered style** — no bottom-border only approach. This ensures a professional, form-aligned look consistent with enterprise tools.

```
height:           44px
background:       #FFFFFF
border:           1px solid #E4E7EB
border-radius:    6px
padding:          0 14px
font-size:        14px
color:            #111827
placeholder:      #9CA3AF

focus:
  border-color:   #004C22
  outline:        none
  box-shadow:     0 0 0 3px rgba(0, 76, 34, 0.08)

error:
  border-color:   #EF4444
  box-shadow:     0 0 0 3px rgba(239, 68, 68, 0.08)
```

**Label:** Always above the field. 13px, weight 500, `#374151`, margin-bottom 6px.
**Helper text:** 12px, `#6B7280`, margin-top 4px.
**Error text:** 12px, `#991B1B`, margin-top 4px.

**Textarea** (rejection reason, announcement body): same border style, min-height 120px, resize vertical only.

---

### 4.3 Cards

Cards are the primary content container in the dashboard.

```
background:    #FFFFFF
border:        1px solid #E4E7EB
border-radius: 8px
box-shadow:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
padding:       24px
```

**Card Header:** Flex row, heading-md left, optional action (ghost button or icon) right. Bottom border `1px solid #F3F4F6`, padding-bottom 16px, margin-bottom 20px.

**Stat / KPI Card:**
```
padding:       24px
min-height:    120px

Structure:
  - Label: 12px uppercase, weight 600, letter-spacing 0.06em, text-tertiary
  - Value: 28px, weight 700, font-family-numeric (Inter, tabular-nums), text-primary
  - Delta/sub-label: 13px, text-secondary
  - Optional: left 3px border in status color (green = positive, red = alert)
```

---

### 4.4 Data Tables / Grids

Tables are the core interface pattern for this system. Every table follows these rules:

```
table:
  width:           100%
  border-collapse: separate
  border-spacing:  0
  background:      #FFFFFF
  border:          1px solid #E4E7EB
  border-radius:   8px
  overflow:        hidden

thead:
  background:      #F9FAFB
  border-bottom:   2px solid #E4E7EB

th:
  padding:         12px 16px
  font-size:       12px
  font-weight:     600
  color:           #6B7280
  text-transform:  uppercase
  letter-spacing:  0.05em
  text-align:      left
  white-space:     nowrap

tbody tr:
  height:          56px
  border-bottom:   1px solid #F3F4F6
  transition:      background 150ms ease

tbody tr:hover:
  background:      #F9FAFB
  cursor:          pointer (if navigable)

td:
  padding:         0 16px
  font-size:       14px
  color:           #111827
  vertical-align:  middle
```

**Column Types:**

- **ID / Code**: `font-family-numeric` (Inter, tabular-nums), 13px, `#6B7280`, background `#F9FAFB` pill
- **Name / Primary**: 14px, weight 500, `#111827`
- **Numeric (THB, kgCO₂e)**: `font-family-numeric` (Inter, tabular-nums), right-aligned
- **Date / Timestamp**: 13px, `#6B7280`
- **Status Badge**: see Badge spec below
- **Actions column**: right-aligned, ghost icon buttons only (no full text buttons in rows)

**Empty State:**
```
padding:     80px 24px
text-align:  center
icon:        32px outline, text-tertiary
heading:     heading-sm, text-secondary
body:        body-md, text-tertiary
```

**Pagination:**

- Bottom of table, right-aligned
- "Showing X–Y of Z results" in caption left
- Prev/Next ghost buttons + page numbers, active page in primary fill

---

### 4.5 Status Badges

```
display:       inline-flex
align-items:   center
height:        24px
padding:       0 10px
border-radius: 4px
font-size:     12px
font-weight:   600
letter-spacing: 0.02em
```

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `verified` | `#F0FFF4` | `#166534` | Approved, Active, Paid |
| `pending` | `#FFFBEB` | `#92400E` | Pending, In Review |
| `rejected` | `#FEF2F2` | `#991B1B` | Rejected, Flagged |
| `info` | `#EFF6FF` | `#1E40AF` | Draft, Queued |
| `neutral` | `#F3F4F6` | `#6B7280` | Inactive, Skipped |

Optional dot indicator: 6px circle, same color as text, margin-right 6px.

---

### 4.6 Navigation (Sidebar Items)

```css
/* Sidebar background: #004C22 */

.nav-item {
  display:       flex;
  align-items:   center;
  height:        44px;
  padding:       0 20px;
  border-radius: 0 6px 6px 0;
  margin:        2px 12px 2px 0;
  color:         rgba(255, 255, 255, 0.7);
  font-size:     14px;
  font-weight:   500;
  gap:           12px;
  transition:    all 150ms ease;
  cursor:        pointer;
}

.nav-item:hover {
  background:    rgba(255, 255, 255, 0.08);
  color:         rgba(255, 255, 255, 0.95);
}

.nav-item.active {
  background:    rgba(255, 255, 255, 0.15);
  color:         #FFFFFF;
  font-weight:   600;
  border-left:   3px solid #FFFFFF;
  padding-left:  17px;
}

.nav-item .icon {
  width:         18px;
  height:        18px;
  stroke-width:  1.75px;
  flex-shrink:   0;
}

.nav-section-label {
  font-size:     10px;
  font-weight:   700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:         rgba(255, 255, 255, 0.35);
  padding:       20px 20px 6px;
}
```

---

### 4.7 Modals & Confirmation Dialogs

```
backdrop:       rgba(17, 24, 39, 0.40)
backdrop-blur:  4px

modal:
  background:     #FFFFFF
  border-radius:  12px
  box-shadow:     0 16px 48px rgba(0,0,0,0.12)
  width:          480px (default) / 640px (large) / 360px (confirm)
  padding:        32px

header:
  font:           heading-md, text-primary
  margin-bottom:  8px

body:
  font:           body-md, text-secondary
  margin-bottom:  24px

footer:
  display:        flex
  justify-content: flex-end
  gap:            12px
```

**Confirmation Dialog pattern:**
1. Heading: "Confirm action" — heading-sm
2. Body: Plain-language consequence description
3. Footer: [Cancel (tertiary)] [Confirm (primary CTA or danger)]

Danger confirmations: Show destructive consequence in `error-bg` alert box above footer.

---

### 4.8 Alert / Notification Banners

Inline banners for page-level feedback (success, error, warning, info):

```
padding:       14px 16px
border-radius: 6px
border-left:   4px solid [status color]
display:       flex
gap:           12px
font-size:     14px
margin-bottom: 20px
```

**Toast notifications** (post-action): bottom-right, 320px wide, same color rules, auto-dismiss 4s.

---

### 4.9 Icons

- **Library:** Lucide Icons (outline style, consistent 1.75px stroke)
- **Size in nav:** 18px
- **Size in buttons:** 16px (leading icon) — 8px gap from label
- **Size in table action column:** 16px, wrapped in 36px ghost icon button
- **Size standalone / informational:** 20–24px
- **Color:** Inherits from text context. Never use brand color for decorative icons.

---

### 4.10 GIS Map Interface (A-06)

The map page is a special full-bleed layout — sidebar persists, but the content area is map-dominant:

```
map-container:
  height:   calc(100vh - 64px)   /* full height minus topbar */
  position: relative

sidebar-panel (detail / filter):
  position:   absolute
  top:        16px
  right:      16px
  width:      340px
  background: #FFFFFF
  border:     1px solid #E4E7EB
  border-radius: 8px
  box-shadow: 0 4px 12px rgba(0,0,0,0.08)
  padding:    20px
  max-height: calc(100vh - 96px)
  overflow-y: auto
```

**Polygon styling:**

- Verified (no flag): fill `rgba(34, 197, 94, 0.15)`, stroke `#16A34A` 2px
- Flagged (overlap > 15%): fill `rgba(239, 68, 68, 0.15)`, stroke `#EF4444` 2px, animated pulse on stroke
- Pending: fill `rgba(245, 158, 11, 0.15)`, stroke `#F59E0B` 2px
- Selected / Hovered: stroke width 3px, fill opacity 0.25

**Alert badge (overlap count):** Positioned top-left of map, red pill badge, white text.
**Filter toggle:** Ghost button row above map area, not overlaid on map.

---

### 4.11 File Upload (Payout Slip)

```
upload-zone:
  border:         2px dashed #E4E7EB
  border-radius:  8px
  background:     #F9FAFB
  padding:        32px
  text-align:     center
  cursor:         pointer
  transition:     all 200ms ease

upload-zone:hover, upload-zone.drag-over:
  border-color:   #004C22
  background:     #F0FFF4

icon:   32px, text-tertiary
label:  body-md, text-secondary — "Drag slip image here, or click to browse"
sub:    caption — "PNG, JPG up to 10MB"

uploaded-preview:
  flex row, image thumbnail (64×64, border-radius 4px, object-fit cover)
  filename + size in body-sm
  remove button (ghost icon, danger hover)
```

---

### 4.12 Role Badge (Topbar)

```
background:   primary-subtle (#F0FFF4)
border:       1px solid primary-muted (#D1FAE5)
color:        #166534
padding:      3px 10px
border-radius: 4px
font-size:    12px
font-weight:  600
letter-spacing: 0.04em
text-transform: uppercase
```

---

## 5. Page-Level Layout Patterns

### 5.1 Standard Data Page (e.g., Farmer List, Payout Queue)

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                             │
│  [Display Title]                [Primary CTA Button]   │
│  breadcrumb / subtitle                                  │
├─────────────────────────────────────────────────────────┤
│ Filter / Search Bar                                     │
│  [Search input]  [Filter dropdown]  [Status filter]    │
├─────────────────────────────────────────────────────────┤
│ Data Table                                              │
│  (full width, white card, bordered)                     │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Pagination                               [X–Y of Z]    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard Home (KPI Overview)

```
┌─────────────────────────────────────────────────────────┐
│ Page Header: "Dashboard"    [Today: 20 May 2025]        │
├───────────┬───────────┬───────────┬─────────────────────┤
│ KPI Card  │ KPI Card  │ KPI Card  │ KPI Card            │
│ (3 or 4 col grid, responsive)                          │
├─────────────────────────────────────────────────────────┤
│ Quick Access Links (role-based)                         │
│  [Ghost cards with icon + label + chevron]              │
└─────────────────────────────────────────────────────────┘
```

KPI alert cards (Pending KYC, Flagged Farms, Pending Payouts): left border `4px solid #C8000E` when count > 0.

### 5.3 Detail Page (e.g., Farmer Detail, Payout Detail)

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to [list]                                        │
│ Page Header: Farmer Name · Badge [Active]               │
├──────────────────────────────┬──────────────────────────┤
│ Main Info Card               │ Action Panel Card        │
│ (2/3 width)                  │ (1/3 width, sticky)      │
│                              │                          │
│ Tabbed sections:             │ Status + Actions         │
│ [Overview] [Documents]       │ (Approve / Reject)       │
│ [Farm Data] [History]        │                          │
├──────────────────────────────┴──────────────────────────┤
│ Timeline / Status History (if applicable)               │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Login Page (A-01 / V-01)

```
Full screen: background #F7F8F9

Centered card:
  width:        440px
  background:   #FFFFFF
  border:       1px solid #E4E7EB
  border-radius: 12px
  padding:      48px
  box-shadow:   0 4px 12px rgba(0,0,0,0.06)

Header:
  FarmFlow logo (centered, 32px height)
  Subdomain label: "Admin Dashboard" or "Verifier Portal" (caption, text-tertiary, centered)
  margin-bottom: 32px

Form:
  Email input
  Password input
  [Login button — full width, Primary CTA Red]

Footer:
  caption, text-tertiary, centered — "FarmFlow Carbon Platform · Internal Access Only"
```

---

## 6. Verifier Portal Differentiation

The External Verifier Portal (`verifier.farmflow.[domain]`) shares the same component library but uses **subtle visual cues** to distinguish it from the Admin Dashboard:

| Element | Admin Dashboard | Verifier Portal |
|---------|----------------|----------------|
| Topbar label | "Admin Dashboard" | "Verifier Portal" |
| Role badge | `MASTER` / `VERIFY` / etc. | `VGREEN VERIFIER` (or org name) |
| Sidebar accent | White active border | `#86EFAC` (lighter green) for active |
| Login page subtitle | "Internal Access Only" | "Authorized Verifiers Only" |
| PDF action button | Not visible | Prominent — "Download PDF Report" |

---

## 7. Motion & Interaction

Keep motion minimal and purposeful — this is a professional tool, not a consumer product.

```
transition-standard:  150ms ease
transition-enter:     200ms ease-out
transition-exit:      150ms ease-in

page-transition:      opacity 0→1, translateY(8px→0), 200ms ease-out
modal-enter:          opacity + scale(0.97→1), 200ms ease-out
toast-enter:          translateX(100%→0), 250ms ease-out
toast-exit:           opacity 1→0, 150ms ease-in

row-hover:            background transition, 100ms ease
button-hover:         translateY(-1px), 150ms ease (primary CTA only)
```

**No:** parallax, scroll animations, entrance animations on data cells, decorative looping animations.
**Yes:** Loading skeletons for async data (shimmer effect, neutral tones), subtle hover lifts on cards, focus ring transitions.

---

## 8. Loading & Empty States

### Skeleton Loading
```
background:    linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)
background-size: 400% 100%
animation:     shimmer 1.5s ease infinite
border-radius: 4px
```
Use for: table rows (show 5–8 skeleton rows), KPI card values, map panel.

### Empty State
Center-aligned within the container:

- Outline icon (32px, `#D1D5DB`)
- Heading: "No [items] found" — heading-sm, text-secondary
- Description: 1–2 lines of context — body-md, text-tertiary
- Optional CTA: ghost button

---

## 9. Accessibility Standards

- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text and UI components
- All interactive elements keyboard-navigable, visible focus ring (`outline: 2px solid #004C22, outline-offset: 2px`)
- Form errors announced via `aria-describedby`
- Data tables: proper `<thead>`, `scope="col"`, `aria-sort` on sortable columns
- Status badges: never rely on color alone — always include text label
- Modals: focus trap, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Map (A-06): non-map fallback data table for screen readers

---

## 10. Responsive Behavior

Primary target: **1280px+ desktop**. Tablet (768px–1279px) is supported with layout adjustments.

| Breakpoint | Sidebar | Content |
|-----------|---------|---------|
| 1280px+ | Fixed 240px | Full layout |
| 1024–1279px | Fixed 220px | Slightly compressed grid |
| 768–1023px | Collapsible (icon-only 64px, expandable overlay) | Single column sections |
| < 768px | Hidden (hamburger trigger, overlay) | Mobile stack |

Table columns on tablet: hide lower-priority columns (timestamps, secondary IDs). Show essential columns + status badge + action.

---

## 11. Brand Mark Usage

**Logo composition:** Leaf/carbon icon mark (outline style, 2px stroke) + "FarmFlow" wordmark in Montserrat Semi-Bold.

- On dark backgrounds (sidebar): white full-opacity
- On light backgrounds (login, topbar): `#004C22` primary
- Minimum clear space: 16px all sides
- Minimum size: 24px height

**Do not:** apply color fills to the icon mark, use on busy photographic backgrounds, stretch or rotate.

---

## 12. Design Tokens (CSS Variables)

```css
:root {
  /* Background */
  --bg-base:             #F7F8F9;
  --bg-surface:          #FFFFFF;
  --bg-sunken:           #F0F2F4;

  /* Border */
  --border-default:      #E4E7EB;
  --border-strong:       #C9CDD3;
  --border-focus:        #004C22;

  /* Text */
  --text-primary:        #111827;
  --text-secondary:      #4B5563;
  --text-tertiary:       #9CA3AF;
  --text-disabled:       #D1D5DB;

  /* Brand */
  --color-primary:       #004C22;
  --color-primary-hover: #003A1A;
  --color-primary-subtle:#F0FFF4;
  --color-primary-muted: #D1FAE5;
  --color-accent:        #C8000E;
  --color-accent-hover:  #A80009;

  /* Status */
  --status-success-bg:   #F0FFF4;
  --status-success-text: #166534;
  --status-warning-bg:   #FFFBEB;
  --status-warning-text: #92400E;
  --status-error-bg:     #FEF2F2;
  --status-error-text:   #991B1B;
  --status-info-bg:      #EFF6FF;
  --status-info-text:    #1E40AF;

  /* Typography */
  --font-display:  'Montserrat', system-ui, -apple-system, sans-serif;  /* main headings */
  --font-body:     'Open Sans', system-ui, -apple-system, sans-serif;   /* body content */
  --font-numeric:  'Inter', system-ui, -apple-system, sans-serif;       /* numeric data (tabular-nums) */
  --font-thai:     'Prompt', system-ui, -apple-system, sans-serif;      /* Thai-language content */

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  12px;
  --radius-full:9999px;

  /* Shadow */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg:  0 16px 48px rgba(0,0,0,0.12);

  /* Sidebar */
  --sidebar-bg:    #004C22;
  --sidebar-width: 240px;
  --topbar-height: 64px;
}
```
