# FarmFlow — Executive Dashboard · Build Prompt for Claude Code

> **วิธีใช้:** วางไฟล์นี้ให้ Claude Code เป็น spec หลัก แล้วสั่ง `implement the FarmFlow Executive Dashboard per this spec`. สิ่งที่ **ห้าม** คือ mock data — ทุกตัวเลขต้องมาจาก DB/API จริง ตาม Data Contract ในหัวข้อ 4–6. ก่อนเริ่ม ให้ Claude Code อ่าน `ERD v3`, `Data Dictionary`, และ carbon-calculator spec ของ FarmFlow เพื่อ bind ชื่อ table/column ให้ตรงของจริง (ชื่อในไฟล์นี้เป็น *expected entity* ที่ต้อง reconcile กับ schema ปัจจุบัน ไม่ใช่ ground truth)

---

## 0. Intent (อ่านก่อน)

สร้าง **Executive Dashboard** สำหรับผู้บริหาร/finance/partner (TRUE, VGREEN, TGO) ดูภาพรวมพอร์ตคาร์บอนเครดิตของ FarmFlow แบบ point-in-time ("Data as of ...") หน้าตาสะอาด โปร่ง โทนเขียวป่า เหมือน reference deck ที่แนบมา แต่ **ผูกกับ pipeline MRV จริง** ตามมาตรฐาน T-VER

ผู้ใช้เป้าหมาย: read-only viewer ระดับ exec — ไม่มีการแก้ไขข้อมูลในหน้านี้

หลักสำคัญ 1 ข้อ: **ทั้งหน้าเป็น snapshot ณ วันที่เลือก (`asOfDate`)** ทุก KPI, chart, ตาราง ต้องคำนวณเทียบกับ `asOfDate` ไม่ใช่ `now()`

---

## 1. Non-negotiables — ห้าม mock

- ❌ ห้าม hardcode ตัวเลขใด ๆ (125,680 / 18.4% / 24 communities ในภาพเป็นแค่ตัวอย่าง layout)
- ✅ ทุก widget ต้องมี: `loading` (skeleton), `empty` (ยังไม่มีข้อมูล), `error` state
- ✅ ทุก metric ต้องระบุ data source + query logic ได้ (ดูหัวข้อ 4) — ถ้า metric ไหน derive ไม่ได้จาก schema จริง ให้ Claude Code **หยุดแล้วถาม** ไม่ใช่เดา
- ✅ ตัวเลขที่เป็น aggregate ต้องเคารพ **Zero/Minimal-PII policy** — นับ/รวมได้ ห้าม leak ตัวตนเกษตรกรออกมาที่ layer นี้
- ✅ Number formatting: locale `th-TH`, คั่นหลักพัน, `tCO₂e` เป็น unit label, % ทศนิยม 1 ตำแหน่ง

---

## 2. Visual Design Spec

### 2.1 Mood
Clean · airy · trustworthy · "measurable nature". พื้นหลังขาว/off-white, การ์ดลอยเบา ๆ, เว้นวรรคเยอะ, ตัวเลขใหญ่เป็นพระเอก, เขียวป่าเป็น accent เดียวที่เด่น สีอื่น (น้ำเงิน/ส้ม/ม่วง) ใช้เฉพาะใน chart เพื่อแยก category

### 2.2 Design Tokens
```css
/* Color — Brand */
--ff-green-900: #1B5E20;
--ff-green-700: #2E7D32;   /* primary text-accent, up-arrows */
--ff-green-500: #43A047;   /* primary fill */
--ff-green-400: #66BB6A;
--ff-green-tint: #E8F5E9;  /* icon chip bg, subtle card wash */
--ff-green-tint-2: #F1F8F4;

/* Neutrals */
--ff-ink: #1A1D1A;         /* headings, big numbers */
--ff-ink-60: #5B615B;      /* labels */
--ff-ink-40: #8A908A;      /* captions / sub-labels */
--ff-bg: #FAFBFA;          /* page bg */
--ff-card: #FFFFFF;
--ff-border: #ECEFEC;

/* Semantic */
--ff-up: #2E7D32;          /* positive delta */
--ff-down: #C62828;        /* negative delta (image ไม่มี แต่ต้องรองรับ) */
--ff-verified: #2E7D32; --ff-verified-bg: #E8F5E9;

/* Chart categorical palette (donut / project types) */
--c1: #43A047;  /* Reforestation      */
--c2: #26A69A;  /* Forest Restoration */
--c3: #5C7CFA;  /* Mangrove           */
--c4: #F5A623;  /* Agroforestry       */
--c5: #9575CD;  /* Improved Land Mgmt  */

/* Shape */
--radius-card: 16px; --radius-chip: 12px; --radius-pill: 999px;
--shadow-card: 0 1px 2px rgba(16,24,16,.04), 0 4px 16px rgba(16,24,16,.04);
--gap: 20px;
```

### 2.3 Typography
- Font: `Inter` / `IBM Plex Sans` (Latin) + `IBM Plex Sans Thai` (Thai fallback) — ต้องรองรับไทยครบ
- Section header: 12–13px, **UPPERCASE**, `letter-spacing .06em`, weight 600, สี `--ff-ink-60`
- KPI big number: 34–40px, weight 700, `--ff-ink`; unit `tCO₂e` เป็น 13px `--ff-ink-40` ต่อท้าย baseline
- Delta chip: 12px weight 600 สี `--ff-up`/`--ff-down` + ไอคอนลูกศร ↑/↓ นำหน้า, ตามด้วย "vs {baseline label}" สีเทา

### 2.4 Card & Layout
- การ์ดขาว radius 16, border `--ff-border` 1px, shadow เบา (`--shadow-card`), padding 20–24
- Icon chip: วงกลม/มน 40–44px พื้น `--ff-green-tint`, ไอคอน stroke `--ff-green-700`
- Grid: responsive 12-col, `--gap` 20px
  - Desktop ≥1200: ตาม blueprint หัวข้อ 3
  - Tablet 768–1199: KPI 2×2, chart stack เต็มกว้าง
  - Mobile <768: single column, ทุกอย่างซ้อนแนวตั้ง
- Icon set: `lucide-react` (leaf, award, pie-chart, trees, cloud, users, badge-check, map-pin, calendar) — stroke style, ไม่ fill

---

## 3. Layout Blueprint (map ตรงกับภาพ reference)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [FarmFlow logo] EXECUTIVE DASHBOARD              [📅 Data as of ▾]  [true]   │  Header
│ tagline: "Real Impact. Lasting Future."                                     │
├──────────┬────────────────────────────────────────────────────────────────┤
│  BRAND   │ ┌─KPI 1──┐ ┌─KPI 2──┐ ┌─KPI 3──┐ ┌─KPI 4──┐                       │
│  RAIL    │ │ Issued │ │ThisMo. │ │Retired │ │Projects│                       │  KPI row (4)
│ (hero    │ └────────┘ └────────┘ └────────┘ └────────┘                       │
│  image + │ ┌── Issuance Over Time (area) ──┐ ┌── By Project Type (donut) ──┐ │  Mid row (2)
│  quote)  │ └───────────────────────────────┘ └────────────────────────────┘ │
│          │ ┌─ Locations ─┐ ┌─ Impact Highlights ─┐ ┌─ Recent Projects ─┐    │  Bottom row (3)
│          │ └─────────────┘ └─────────────────────┘ └───────────────────┘    │
├──────────┴────────────────────────────────────────────────────────────────┤
│  CREATING VALUE BEYOND CARBON · Support Communities · Biodiversity · ...     │  Footer strip
└───────────────────────────────────────────────────────────────────────────┘
```

**Branding:** FarmFlow เป็น primary brand (โลโก้ + "EXECUTIVE DASHBOARD"). โลโก้ `true` มุมขวาบนคงไว้ได้ในฐานะ partner/funder (Open Innovation Runway) — ทำเป็น config flag `SHOW_PARTNER_LOGO`

**Brand rail (คอลัมน์ซ้าย):** hero image ป่า/ภูเขา + headline "Turning nature into measurable climate impact" + leaf icon + quote. คอลัมน์นี้เป็น static/CMS content ไม่ต้องดึง DB (จะ hardcode ตรงนี้ได้ เพราะเป็น brand copy ไม่ใช่ metric)

---

## 4. Data Contract — หัวใจของงาน

> สำหรับแต่ละ widget: **นิยาม → แหล่งข้อมูล → logic → response shape**. ทุกอย่างผูก `asOfDate`.
> **Lifecycle states ที่อ้างถึง** (bind กับ enum จริงใน schema): `enrolled → measured → estimated → under_verification → verified → issued → sold → retired`. "Verifier Gate" = ต้องผ่าน `verified` ก่อนถึงจะ `issued` ได้

### นิยามกลาง (ใช้ซ้ำ)
- **Issued (cumulative)** = เครดิตที่ TGO/อบก. ออกให้แล้ว = จำนวน `tCO₂e` ที่ record มี `issuance_date <= asOfDate` และ state ∈ `{issued, sold, retired}`
- **Retired** = state = `retired` และ `retired_date <= asOfDate`
- **Active/available** = Issued − Retired (มีไว้เผื่อ ไม่อยู่ในภาพ)
- ทุก sum ของ tCO₂e ให้ดึงจาก column ที่เป็น **verified quantity** (ปริมาณที่ผ่าน VVB แล้ว) ไม่ใช่ค่าประเมิน on-device ดิบ

---

### 4.1 KPI Card 1 — TOTAL CARBON CREDIT ISSUED
| field | value |
|---|---|
| **นิยาม** | เครดิตสะสมทั้งหมดที่ออกแล้ว ณ `asOfDate` |
| **source** | `credit_issuances` (tCO₂e, issuance_date, project_id) — reconcile กับ ERD v3 |
| **logic** | `SUM(quantity_tco2e) WHERE issuance_date <= :asOf` |
| **delta** | เทียบ cumulative ณ `asOf` กับ cumulative ณ `baselineDate` (default = 31 Dec ปีก่อน). `delta% = (nowCum − baseCum)/baseCum`. label = "vs {baselineDate}" |
| **display** | big number + `tCO₂e` + delta chip |

### 4.2 KPI Card 2 — THIS MONTH (issued in period)
| | |
|---|---|
| **นิยาม** | เครดิตที่ออกภายในเดือนของ `asOfDate` |
| **logic** | `SUM(quantity_tco2e) WHERE issuance_date BETWEEN date_trunc('month',:asOf) AND :asOf` |
| **delta** | เทียบกับยอดออกทั้งเดือนก่อนหน้า → "vs {prevMonth label}" |

### 4.3 KPI Card 3 — CREDITS RETIRED
| | |
|---|---|
| **นิยาม** | เครดิตที่ถูก retire (ขาย+ปลดระวางถาวร) สะสม |
| **source** | `credit_retirements` / state=`retired` |
| **logic** | `SUM(quantity_tco2e) WHERE state='retired' AND retired_date <= :asOf` |
| **delta** | vs baseline เหมือน 4.1 |

### 4.4 KPI Card 4 — PROJECTS
| | |
|---|---|
| **นิยาม** | จำนวนโครงการ active + จำนวน location |
| **source** | `projects` (province/geom), นับ distinct |
| **logic** | `COUNT(*) WHERE status='active' AND enrolled_at <= :asOf` ; sub = `COUNT(DISTINCT province)` |
| **display** | "{n} Projects" + sub "{m} Locations" (ไม่มี delta) |

---

### 4.5 Chart — CARBON CREDIT ISSUANCE OVER TIME (area, cumulative)
| | |
|---|---|
| **นิยาม** | เส้นสะสมของเครดิตที่ออกแล้ว รายเดือน ย้อนหลัง N เดือน (default 6) ถึง `asOfDate` |
| **logic** | สร้าง month bucket → แต่ละเดือนคำนวณ **cumulative** issued ณ สิ้นเดือนนั้น (running total). จุดสุดท้าย = ยอด ณ `asOf` |
| **display** | area chart, fill = gradient `--ff-green-500→transparent`, เส้น `--ff-green-700`. data label ที่แต่ละจุด. tooltip callout ที่จุดล่าสุด แสดง "{monthLabel}: {value} tCO₂e" (เหมือนภาพ) |
| **response** | `[{ month:'2024-01', cumulative:18420 }, ...]` |
| **หมายเหตุ** | ภาพ reference เป็น **cumulative** (เส้นโตขึ้นเรื่อย ๆ ไม่ใช่ยอดรายเดือน) — ทำให้ตรงนี้ |

### 4.6 Chart — CARBON CREDIT BY PROJECT TYPE (donut)
| | |
|---|---|
| **นิยาม** | สัดส่วน issued แยกตามประเภทโครงการ |
| **source** | `projects.project_type` × issued credits |
| **logic** | `SUM(quantity_tco2e) GROUP BY project_type WHERE issuance_date <= :asOf` → คำนวณ % ต่อ total |
| **categories** | map enum จริงเข้ากับ label + สี: Reforestation→`--c1`, Forest Restoration→`--c2`, Mangrove Restoration→`--c3`, Agroforestry→`--c4`, Improved Land Management→`--c5`. ประเภทที่ไม่รู้จัก → "Other" สีเทา |
| **display** | donut, center = total `tCO₂e`, legend ขวา = label + % (เรียงมาก→น้อย), footer = Total |

---

### 4.7 Card — PROJECT LOCATIONS (map + table)
| | |
|---|---|
| **นิยาม** | จังหวัด × issued credits + หมุดบนแผนที่ไทย |
| **source** | `projects.geom` (PostGIS) + province; ใช้ `ST_Centroid`/`ST_PointOnSurface` ต่อจังหวัดสำหรับหมุด |
| **logic** | `SUM(tco2e) GROUP BY province ORDER BY sum DESC`. Top 4–5 แสดงเป็น row, ที่เหลือรวมเป็น "Other Locations". row สุดท้าย = Total |
| **map** | Thailand outline (SVG/GeoJSON static) + หมุดสี `--ff-green-700` ตาม centroid จังหวัดที่มีเครดิต ขนาดหมุด ~ สัดส่วน |
| **PII** | ระดับ province เท่านั้น — ห้ามพิกัดแปลงเกษตรกรราย ๆ ในหน้านี้ |

### 4.8 Card — IMPACT HIGHLIGHTS
3 ตัวเลข ทุกตัว ณ `asOf`:
| metric | logic |
|---|---|
| **Trees Supported** | `SUM(tree_count)` ข้ามทุกแปลง active (หรือ estimated จาก stem density × area ถ้าไม่มี count จริง — ใช้ field ที่ verify แล้ว). format `1.2M+` เมื่อ ≥1e6 |
| **CO₂ Removed** | = Total Issued (reuse 4.1) หรือ gross verified sequestration — **ระบุให้ชัดว่าใช้ตัวไหน** อย่าให้ผู้ใช้สับสนว่าซ้ำกับ KPI Issued |
| **Communities Supported** | `COUNT(DISTINCT community_id)` (นับกลุ่ม/หมู่บ้าน — count เท่านั้น, ไม่ดึงชื่อ/ตัวตน) |

### 4.9 Card — RECENT PROJECTS
| | |
|---|---|
| **logic** | `SELECT name, province, thumbnail_url, verification_status FROM projects WHERE verification_status='verified' ORDER BY verified_at DESC LIMIT 3` |
| **display** | thumbnail (รูปแปลง/ป่า) + name + province + pill "Verified" (`--ff-verified-bg`/`--ff-verified`). ล่าง = link "View all projects →" ไปหน้า project list |
| **verified badge** | ผูกกับ **Verifier Gate** จริง — badge ขึ้นเฉพาะโครงการที่ผ่าน VVB (VGREEN) แล้วเท่านั้น |
| **image PII** | ใช้รูปแปลง/ภูมิทัศน์ ห้ามรูปที่มีใบหน้าบุคคล |

---

## 5. API Endpoints (REST — Next.js route handlers / BFF)

ทำเป็น **1 aggregate endpoint** เพื่อลด round-trip + 1 selector meta:

```
GET /api/dashboard/executive?asOf=YYYY-MM-DD&baseline=YYYY-MM-DD&months=6
→ 200 {
    asOf, baseline,
    kpis: {
      totalIssued:  { value, unit:'tCO2e', deltaPct, deltaLabel },
      thisMonth:    { value, unit, deltaPct, deltaLabel },
      retired:      { value, unit, deltaPct, deltaLabel },
      projects:     { count, locations }
    },
    issuanceSeries: [{ month, cumulative }],
    byProjectType:  { total, segments:[{ key, label, value, pct, color }] },
    locations:      { total, rows:[{ province, value, lat, lng }], others:{ value } },
    impact:         { treesSupported, co2Removed, communities },
    recentProjects: [{ id, name, province, thumbnailUrl, status }]
  }

GET /api/dashboard/period-bounds   → { minDate, maxDate }  // สำหรับ date picker
```

- ทุก query อยู่ใน service layer ที่ parametrize `asOf`/`baseline` — ไม่มี inline literal
- Cache: revalidate ~5–15 นาที (ข้อมูล MRV ไม่ real-time), แต่ **invalidate เมื่อมี issuance/retirement ใหม่**
- Auth: endpoint นี้ต้อง role `exec`/`finance`/`partner` (viewer). ไม่มี write

---

## 6. Date-as-of / Period Selector

- Control มุมขวาบน = dropdown/date-picter → set `asOfDate`
- Default `asOf` = ล่าสุดที่มีข้อมูล (`maxDate` จาก period-bounds) ไม่ใช่ today
- เปลี่ยน `asOf` → refetch aggregate endpoint → ทั้งหน้า re-render (KPI/chart/map/table ทุกอย่างเลื่อนตาม)
- `baseline` default = `31 Dec (year(asOf)-1)`; ให้ config ได้
- แสดง label "Data as of {formatted asOf}" ชัดเจน — ผู้ใช้ต้องรู้ว่านี่คือ snapshot

---

## 7. FarmFlow Semantics (กันเข้าใจผิด)

- **T-VER compliance:** ตัวเลข issued/retired ต้อง trace กลับไปที่ credit ที่ผ่าน VVB + registered กับ TGO. อย่านับค่าประเมิน on-device (`estimated`) เป็น issued
- **session_id (golden thread):** ทุก measurement/estimate ผูก `session_id` (3S: Snap→Sync→Sustain). Dashboard ไม่โชว์ session ราย ๆ แต่ integrity ของ aggregate ต้องมาจาก session ที่ complete แล้ว
- **Verifier Gate:** เป็นเงื่อนไข hard สำหรับ "Verified" badge และสำหรับการนับ issued — เคารพให้ตรง
- **Zero/Minimal-PII:** ทุก aggregate = count/sum ระดับ province/community/project. ห้ามชื่อ/พิกัด/ตัวตนเกษตรกร leak เข้า response ของหน้านี้
- **หน่วยเงิน:** หน้านี้เป็น carbon volume ไม่ใช่การเงิน — ไม่ต้องมี take-rate/revenue (แยกไป finance dashboard ต่างหาก)

---

## 8. Tech Stack & Constraints

- Web: **Next.js (App Router)** + TypeScript; charts = Recharts (หรือ visx) ; map = react-simple-maps / MapLibre + GeoJSON ไทย
- Data: **PostgreSQL + PostGIS**; query ผ่าน service layer (Prisma/Kysely/raw SQL — ตามที่โปรเจกต์ใช้อยู่)
- ทำ **skeleton loaders** ต่อ widget, `Suspense` boundaries, error boundary ต่อ card (card เดียวพังไม่ล้มทั้งหน้า)
- Responsive ตามหัวข้อ 2.4; a11y: WCAG AA contrast (มี design token contrast table ของ FarmFlow อยู่แล้ว ให้ยึดตามนั้น), `aria-label` บนทุก chart, ตัวเลขมี text alternative
- i18n-ready: label ผ่าน dictionary (TH/EN) — big numbers ใช้ `Intl.NumberFormat('th-TH')`

---

## 9. Definition of Done

- [ ] ไม่มี literal ตัวเลข metric ใน component — ทุกค่ามาจาก `/api/dashboard/executive`
- [ ] เปลี่ยน `asOf` แล้วทุก widget ขยับสอดคล้องกัน (ตรวจ cross-consistency: Total Issued = donut total = CO₂ Removed ถ้านิยามให้เท่ากัน)
- [ ] Verified badge ตรงกับ Verifier Gate state จริง
- [ ] Loading / empty / error ครบทุกการ์ด
- [ ] ไม่มี PII ราย individual ใด ๆ ใน network response
- [ ] Chart issuance เป็น cumulative และ tooltip callout ทำงาน
- [ ] Map หมุดขึ้นจาก PostGIS centroid จริง ไม่ hardcode พิกัด
- [ ] Match design tokens หัวข้อ 2 (โทนเขียว, การ์ด radius 16, section header uppercase)

---

## 10. สั่ง Claude Code เริ่มยังไง

1. อ่าน `ERD v3` + `Data Dictionary` + carbon-calculator spec → ทำ **mapping table**: ทุก metric ในหัวข้อ 4 → table/column จริง. ตรงไหน map ไม่ได้ → list ออกมาถามก่อน อย่าเดา
2. Scaffold service layer + `/api/dashboard/executive` (+ tests ด้วยข้อมูลจริงใน dev DB)
3. Build UI ตาม blueprint + tokens, wire เข้า endpoint
4. รัน consistency checks ในหัวข้อ 9

> ก่อน implement widget ใด ๆ ให้ตอบกลับ mapping table (metric → source) มาให้ review ก่อน แล้วค่อยลงมือ
