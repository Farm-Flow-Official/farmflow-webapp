# FarmFlow — T-VER Allometric & Growth-Increment Spec (58 Tree Species)

> Machine-readable specification extracted from
> `FarmFlow_TVER_สมการ58ชนิด_เพิ่มพูน.xlsx`.
> Purpose: give Claude Code everything needed to implement the per-tree
> carbon calculator and the year-1→10 increment (additionality) forecast
> **without** re-reading the workbook or reconstructing the `INDEX/MATCH`
> formulas.

---

## 0. Core design fact (read this first)

TGO (อบก.) does **not** define per-species equations for these 58 species.
Equations are defined **per plant group**. Consequently:

- **57 terrestrial trees** (everything except bamboo) use the **`GEN`**
  group — the general terrestrial-tree equation (Ogawa et al. 1965).
- **Bamboo** (`ไผ่ทุกชนิด`) uses a **bamboo** group (`BAM1` by default).

What actually varies **per species** is the **growth increment**
(`ΔDBH`, `ΔH` per year), taken from the 2554 species-potential manual,
which classifies species into growth groups (`TEAK / SLOW / MULTI /
URBAN`, plus a FarmFlow-assumed `BAMBOO`).

So the model is two lookups per species:

```
species → equation_group  (drives WS/WB/WL/WT, R, CF)
species → increment_group (drives ΔDBH, ΔH for the forecast)
```

Additional equation groups (`DUR`, `MNG`, `MNG2`, `VIN`, `PLM`, `DRY`,
`MRF`, `PIN2`, `PIN3`) exist in the coefficient table for completeness /
future use but are **not assigned** to any of the 58 default species.
Keep them in the reference table so a species can be re-pointed later.

---

## 1. Calculation pipeline (per tree)

Given a tree with `D` (or `D₀`) in cm and `H` in m, and its equation
group `g`:

```
Step 1  Inputs: D = DBH at 1.30 m (cm), H = total height (m)
                (durian option uses D₀ = ground-level diameter)

Step 2  X (predictor) depends on g.var:
          g.var == "D2H" → X = D² · H
          g.var == "D0"  → X = D₀
          g.var == "D"   → X = D
          g.var == "H"   → X = H

Step 3  Component biomass (kg):
          WS = (g.aS == 0) ? 0 : g.aS · X^g.bS          # stem
          WB = (g.aB == 0) ? 0 : g.aB · X^g.bB          # branch
          WL depends on g.WLmode:
             "OGW" → WL = 1 / (28/(WS+WB) + 0.025)      # Ogawa leaf eqn
             "POW" → WL = g.aL · X^g.bL
             "NA"  → WL = 0

Step 4  WT (above-ground biomass, kg) depends on g.WTmode:
          "SUM" → WT = WS + WB + WL
          "POW" → WT = g.aT · X^g.bT                    # bamboo, vine
          "PLM" → WT = 6.666 + 12.826 · H^0.5 · ln(H)   # palm
        bABG (t) = WT / 1000

Step 5  bBLG (t) = bABG · g.R           # below-ground, root:shoot ratio

Step 6  bTREE (t) = bABG + bBLG = bABG · (1 + g.R)

Step 7  cTREE (tC) = bTREE · g.CF       # carbon fraction

Step 8  tCO2e (per tree) = cTREE · 44/12   # 44/12 = 3.66667
```

Project-level (Steps 9–10, applied after per-tree):

```
Step 9   Sum trees in sample plot → average to tCO2e/rai (ไร่)
Step 10  × actual area (rai) → project CTREE (tCO2e),
         then subtract 3% non-permanence risk buffer (TGO requirement)
```

> **R / CF source — important.** `R` and `CF` used in the carbon math come
> from the **equation group** (Table 1), *not* from the increment group.
> Increment Table 2 also lists `R(2554)` and `CF(2554)` columns, but the
> workbook formulas do **not** use them — they are reference-only. For all
> 57 terrestrial species this means `R = 0.27`, `CF = 0.47` (the `GEN`
> values). Do not accidentally wire Table 2's R/CF into the carbon calc.
> (Flagged in §6.)

---

## 2. Growth-increment forecast (years 1–10)

Uses the tree's **equation group** (for WT) and its **increment group**
(for ΔDBH, ΔH). Year 1 = registration year = baseline.

```
For t = 1..10:
    Dt = D₁ + ΔDBH · (t − 1)
    Ht = H₁ + ΔH   · (t − 1)
    Xt = predictor(Dt, Ht) per g.var          # same rule as Step 2
    Ct = WT(Xt) / 1000 · (1 + g.R) · g.CF · 44/12     # cumulative tCO2e
    ΔCt = Ct − C₁                              # sellable credit; ΔC₁ = 0
```

`ΔCt` is the additionality — carbon above the registration baseline.

Default demo inputs in the workbook: `D₁ = 10 cm`, `H₁ = 8 m`,
carbon price = `150 THB/tCO2e` (both editable).

---

## 3. Equation-group coefficient table (Table 1)

Source: อบก. 2559, forestry/agriculture reference manual, Tables 1–3.

Columns: `var` = predictor type; `aS,bS` stem; `aB,bB` branch;
`WLmode` + `aL,bL` leaf; `WTmode` + `aT,bT` total; `R` root:shoot;
`CF` carbon fraction. A `0` coefficient means "term not used".

| code | group (TH) | var | aS | bS | aB | bB | WLmode | aL | bL | WTmode | aT | bT | R | CF | ref |
|------|-----------|-----|----|----|----|----|--------|----|----|--------|----|----|---|----|-----|
| GEN  | กลุ่มพรรณไม้ทั่วไป (ไม้ยืนต้นบก ทุกชนิด) | D2H | 0.0396 | 0.933 | 0.00349 | 1.03 | OGW | 0 | 0 | SUM | 0 | 0 | 0.27 | 0.47 | Ogawa et al. (1965) — TGO level-1 |
| BAM1 | กลุ่มไผ่ – ไผ่บงป่า | D | 0 | 0 | 0 | 0 | NA | 0 | 0 | POW | 0.1466 | 0.7187 | 0.27 | 0.47 | อิทธิพงศ์ (2557) |
| BAM2 | กลุ่มไผ่ – ไผ่บงดำ/ไผ่ตง | D | 0 | 0 | 0 | 0 | NA | 0 | 0 | POW | 0.49522 | 0.8726 | 0.27 | 0.47 | Kutintara (1995) |
| BAM3 | กลุ่มไผ่ – ไผ่ข้าวหลาม | D | 0 | 0 | 0 | 0 | NA | 0 | 0 | POW | 0.17446 | 1.0437 | 0.27 | 0.47 | Kutintara (1995) |
| BAM4 | กลุ่มไผ่ – ไผ่ไร่ / ไผ่ผาก | D | 0 | 0 | 0 | 0 | NA | 0 | 0 | POW | 0.2425 | 1.0751 | 0.27 | 0.47 | Kutintara (1995) |
| DUR  | ทุเรียน (ทางเลือก – ใช้ D₀ ระดับชิดดิน) | D0 | 0.0051 | 2.982 | 0.0046 | 2.4675 | POW | 0.0101 | 1.9889 | POW | 0.0078 | 2.9605 | 0.27 | 0.47 | ลดาวัลย์ พวงจิตร (2561) — level-2 |
| MNG  | ป่าชายเลน – โกงกาง (Rhizophora) | D2H | 0.05466 | 0.945 | 0.01579 | 0.9124 | POW | 0.0678 | 0.5806 | SUM | 0 | 0 | 0.48 | 0.4715 | Komiyama et al. (1987) |
| MNG2 | ป่าชายเลนชนิดอื่น | D2H | 0.0449 | 0.9549 | 0.02412 | 0.8649 | POW | 0.09422 | 0.5439 | SUM | 0 | 0 | 0.48 | 0.4715 | Komiyama et al. (1987) |
| VIN  | กลุ่มเถาวัลย์ | D | 0 | 0 | 0 | 0 | NA | 0 | 0 | POW | 0.8622 | 2.021 | 0.27 | 0.47 | ชิงชัยและคณะ (2554) |
| PLM  | กลุ่มปาล์ม (ใช้ H อย่างเดียว) | H | 0 | 0 | 0 | 0 | NA | 0 | 0 | PLM | 0 | 0 | 0.41 | 0.413 | Pearson et al. (2005) |
| DRY  | ป่าดิบแล้ง / ป่าดิบเขา | D2H | 0.0509 | 0.919 | 0.00893 | 0.977 | POW | 0.014 | 0.669 | SUM | 0 | 0 | 0.27 | 0.47 | Tsutsumi et al. (1983) |
| MRF  | ป่าดิบชื้น | D2H | 0.0396 | 0.9326 | 0.006003 | 1.027 | OGW | 0 | 0 | SUM | 0 | 0 | 0.27 | 0.47 | Ogawa et al. (1965) |
| PIN2 | ป่าสนเขา (สนสองใบ) | D2H | 0.2141 | 0.9814 | 0.00002 | 1.4561 | POW | 0.00072 | 1.0138 | SUM | 0 | 0 | 0.27 | 0.47 | สุนันทา (2531) |
| PIN3 | ป่าสนเขา (สนสามใบ) | D2H | 0.02698 | 0.946 | 0.00018 | 1.455 | POW | 0.00072 | 1.094 | SUM | 0 | 0 | 0.27 | 0.47 | พงษ์ศักดิ์ (2524) |

### 3a. Same table as JSON (parse this)

```json
{
  "GEN":  {"var":"D2H","aS":0.0396,"bS":0.933,"aB":0.00349,"bB":1.03,"WLmode":"OGW","aL":0,"bL":0,"WTmode":"SUM","aT":0,"bT":0,"R":0.27,"CF":0.47},
  "BAM1": {"var":"D","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"POW","aT":0.1466,"bT":0.7187,"R":0.27,"CF":0.47},
  "BAM2": {"var":"D","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"POW","aT":0.49522,"bT":0.8726,"R":0.27,"CF":0.47},
  "BAM3": {"var":"D","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"POW","aT":0.17446,"bT":1.0437,"R":0.27,"CF":0.47},
  "BAM4": {"var":"D","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"POW","aT":0.2425,"bT":1.0751,"R":0.27,"CF":0.47},
  "DUR":  {"var":"D0","aS":0.0051,"bS":2.982,"aB":0.0046,"bB":2.4675,"WLmode":"POW","aL":0.0101,"bL":1.9889,"WTmode":"POW","aT":0.0078,"bT":2.9605,"R":0.27,"CF":0.47},
  "MNG":  {"var":"D2H","aS":0.05466,"bS":0.945,"aB":0.01579,"bB":0.9124,"WLmode":"POW","aL":0.0678,"bL":0.5806,"WTmode":"SUM","aT":0,"bT":0,"R":0.48,"CF":0.4715},
  "MNG2": {"var":"D2H","aS":0.0449,"bS":0.9549,"aB":0.02412,"bB":0.8649,"WLmode":"POW","aL":0.09422,"bL":0.5439,"WTmode":"SUM","aT":0,"bT":0,"R":0.48,"CF":0.4715},
  "VIN":  {"var":"D","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"POW","aT":0.8622,"bT":2.021,"R":0.27,"CF":0.47},
  "PLM":  {"var":"H","aS":0,"bS":0,"aB":0,"bB":0,"WLmode":"NA","aL":0,"bL":0,"WTmode":"PLM","aT":0,"bT":0,"R":0.41,"CF":0.413},
  "DRY":  {"var":"D2H","aS":0.0509,"bS":0.919,"aB":0.00893,"bB":0.977,"WLmode":"POW","aL":0.014,"bL":0.669,"WTmode":"SUM","aT":0,"bT":0,"R":0.27,"CF":0.47},
  "MRF":  {"var":"D2H","aS":0.0396,"bS":0.9326,"aB":0.006003,"bB":1.027,"WLmode":"OGW","aL":0,"bL":0,"WTmode":"SUM","aT":0,"bT":0,"R":0.27,"CF":0.47},
  "PIN2": {"var":"D2H","aS":0.2141,"bS":0.9814,"aB":0.00002,"bB":1.4561,"WLmode":"POW","aL":0.00072,"bL":1.0138,"WTmode":"SUM","aT":0,"bT":0,"R":0.27,"CF":0.47},
  "PIN3": {"var":"D2H","aS":0.02698,"bS":0.946,"aB":0.00018,"bB":1.455,"WLmode":"POW","aL":0.00072,"bL":1.094,"WTmode":"SUM","aT":0,"bT":0,"R":0.27,"CF":0.47}
}
```

---

## 4. Increment-group table (Table 2)

Source: คู่มือศักยภาพพรรณไม้ (อบก./คณะวนศาสตร์ มก., 2554), Tables 2–3.
`ΔDBH`, `ΔH` = mean annual increment (MAI). `R`, `CF` columns here are
**reference only** — see §1 note and §6.

| code | group (TH) | ΔDBH (cm/yr) | ΔH (m/yr) | R(2554) | CF(2554) | note |
|------|-----------|--------------|-----------|---------|----------|------|
| TEAK   | สัก (พื้นที่เหมาะสมปานกลาง) | 1.12 | 1.08 | 0.27 | 0.4813 | manual-specified |
| SLOW   | พรรณไม้พื้นเมืองโตช้า (พะยูง ประดู่ป่า ตะเคียนทอง มะค่าโมง ยางนา) | 0.76 | 0.74 | 0.26 | 0.4733 | manual-specified |
| MULTI  | พรรณไม้อเนกประสงค์ (ขี้เหล็ก สะเดา มะขาม) | 2.16 | 1.90 | 0.33 | 0.4733 | manual-specified |
| URBAN  | พรรณไม้ปลูกในเมือง (ราชพฤกษ์ สัตบรรณ ประดู่บ้าน อินทนิลน้ำ ปีบ) | 2.77 | 1.06 | 0.28 | 0.4733 | *ΔDBH measured at ground level |
| BAMBOO | ไผ่ — no data in 2554 manual (assumed) | 1.00 | 1.50 | 0.27 | 0.47 | **FarmFlow assumption — replace with real plot data** |

```json
{
  "TEAK":   {"dDBH":1.12, "dH":1.08},
  "SLOW":   {"dDBH":0.76, "dH":0.74},
  "MULTI":  {"dDBH":2.16, "dH":1.90},
  "URBAN":  {"dDBH":2.77, "dH":1.06},
  "BAMBOO": {"dDBH":1.00, "dH":1.50}
}
```

---

## 5. Species → group mapping (58 species)

`eqn` = equation group (Table 1); `incr` = increment group (Table 2).

| # | ชนิดไม้ | scientific name | eqn | incr |
|---|---------|-----------------|-----|------|
| 1 | ตะเคียนทอง | Hopea odorata | GEN | SLOW |
| 2 | ตะเคียนหิน | Hopea ferrea | GEN | SLOW |
| 3 | ตะเคียนชันตาแมว | Neobalanocarpus heimii | GEN | SLOW |
| 4 | ไม้สกุลยาง (ไม่รวมยางพารา) | Dipterocarpus spp. | GEN | SLOW |
| 5 | สะเดา | Azadirachta indica var. siamensis | GEN | MULTI |
| 6 | สะเดาเทียม | Azadirachta excelsa | GEN | MULTI |
| 7 | ตะกู | Neolamarckia cadamba | GEN | MULTI |
| 8 | ยมหิน | Chukrasia tabularis | GEN | SLOW |
| 9 | ยมหอม | Toona ciliata | GEN | SLOW |
| 10 | นางพญาเสือโคร่ง | Prunus cerasoides | GEN | URBAN |
| 11 | นนทรี | Peltophorum pterocarpum | GEN | URBAN |
| 12 | สัตบรรณ / ตีนเป็ดทะเล | Alstonia scholaris / Cerbera odollam | GEN | URBAN |
| 13 | พฤกษ์ | Albizia lebbeck | GEN | MULTI |
| 14 | ปีบ | Millingtonia hortensis | GEN | URBAN |
| 15 | ตะแบกนา | Lagerstroemia floribunda | GEN | URBAN |
| 16 | เสลา | Lagerstroemia loudonii | GEN | URBAN |
| 17 | อินทนิลน้ำ | Lagerstroemia speciosa | GEN | URBAN |
| 18 | ตะแบกเลือด | Terminalia mucronata | GEN | SLOW |
| 19 | นากบุด | Mesua ferrea | GEN | SLOW |
| 20 | ไม้สัก | Tectona grandis | GEN | TEAK |
| 21 | พะยูง | Dalbergia cochinchinensis | GEN | SLOW |
| 22 | ชิงชัน | Dalbergia oliveri | GEN | SLOW |
| 23 | กระซิก | Dalbergia parviflora | GEN | SLOW |
| 24 | กระพี้เขาควาย | Dalbergia cultrata | GEN | SLOW |
| 25 | สาธร | Millettia leucantha | GEN | SLOW |
| 26 | แดง | Xylia xylocarpa var. kerrii | GEN | SLOW |
| 27 | ประดู่ป่า | Pterocarpus macrocarpus | GEN | SLOW |
| 28 | ประดู่บ้าน | Pterocarpus indicus | GEN | URBAN |
| 29 | มะค่าโมง | Afzelia xylocarpa | GEN | SLOW |
| 30 | มะค่าแต้ | Sindora siamensis | GEN | SLOW |
| 31 | เคี่ยม | Cotylelobium lanceolatum | GEN | SLOW |
| 32 | เคี่ยมคะนอง | Shorea henryana | GEN | SLOW |
| 33 | เต็ง | Shorea obtusa | GEN | SLOW |
| 34 | รัง | Shorea siamensis | GEN | SLOW |
| 35 | พะยอม | Shorea roxburghii | GEN | SLOW |
| 36 | ไม้สกุลจำปี | Magnolia spp. | GEN | URBAN |
| 37 | จำปีถิ่นไทย | Magnolia spp. (ถิ่นเดียวของไทย) | GEN | URBAN |
| 38 | แคนา | Dolichandrone serrulata | GEN | MULTI |
| 39 | กัลปพฤกษ์ | Cassia bakeriana | GEN | URBAN |
| 40 | ราชพฤกษ์ | Cassia fistula | GEN | URBAN |
| 41 | สุพรรณิการ์ | Cochlospermum religiosum | GEN | URBAN |
| 42 | เหลืองปรีดียาธร | Tabebuia aurea | GEN | URBAN |
| 43 | มะหาด | Artocarpus lakoocha | GEN | MULTI |
| 44 | มะขามป้อม | Phyllanthus emblica | GEN | MULTI |
| 45 | หว้า | Syzygium cumini | GEN | MULTI |
| 46 | จามจุรี | Samanea saman | GEN | URBAN |
| 47 | พลับพลา | Microcos tomentosa | GEN | SLOW |
| 48 | กันเกรา | Fagraea fragrans | GEN | SLOW |
| 49 | กะทังใบใหญ่ | Litsea grandis | GEN | SLOW |
| 50 | หลุมพอ | Intsia palembanica | GEN | SLOW |
| 51 | กฤษณา | Aquilaria crassna | GEN | MULTI |
| 52 | ไม้หอม | Aquilaria spp. | GEN | MULTI |
| 53 | เทพทาโร | Cinnamomum porrectum | GEN | MULTI |
| 54 | ฝาง | Caesalpinia sappan | GEN | MULTI |
| 55 | ไผ่ทุกชนิด | Bambusa / Dendrocalamus / Thyrsostachys spp. | BAM1 | BAMBOO |
| 56 | ไม้สกุลมะม่วง | Mangifera spp. | GEN | MULTI |
| 57 | ไม้สกุลทุเรียน | Durio spp. | GEN | MULTI |
| 58 | มะขาม | Tamarindus indica | GEN | MULTI |

### 5a. Same mapping as JSON

```json
[
  {"id":1,"th":"ตะเคียนทอง","sci":"Hopea odorata","eqn":"GEN","incr":"SLOW"},
  {"id":2,"th":"ตะเคียนหิน","sci":"Hopea ferrea","eqn":"GEN","incr":"SLOW"},
  {"id":3,"th":"ตะเคียนชันตาแมว","sci":"Neobalanocarpus heimii","eqn":"GEN","incr":"SLOW"},
  {"id":4,"th":"ไม้สกุลยาง (ไม่รวมยางพารา)","sci":"Dipterocarpus spp.","eqn":"GEN","incr":"SLOW"},
  {"id":5,"th":"สะเดา","sci":"Azadirachta indica var. siamensis","eqn":"GEN","incr":"MULTI"},
  {"id":6,"th":"สะเดาเทียม","sci":"Azadirachta excelsa","eqn":"GEN","incr":"MULTI"},
  {"id":7,"th":"ตะกู","sci":"Neolamarckia cadamba","eqn":"GEN","incr":"MULTI"},
  {"id":8,"th":"ยมหิน","sci":"Chukrasia tabularis","eqn":"GEN","incr":"SLOW"},
  {"id":9,"th":"ยมหอม","sci":"Toona ciliata","eqn":"GEN","incr":"SLOW"},
  {"id":10,"th":"นางพญาเสือโคร่ง","sci":"Prunus cerasoides","eqn":"GEN","incr":"URBAN"},
  {"id":11,"th":"นนทรี","sci":"Peltophorum pterocarpum","eqn":"GEN","incr":"URBAN"},
  {"id":12,"th":"สัตบรรณ / ตีนเป็ดทะเล","sci":"Alstonia scholaris / Cerbera odollam","eqn":"GEN","incr":"URBAN"},
  {"id":13,"th":"พฤกษ์","sci":"Albizia lebbeck","eqn":"GEN","incr":"MULTI"},
  {"id":14,"th":"ปีบ","sci":"Millingtonia hortensis","eqn":"GEN","incr":"URBAN"},
  {"id":15,"th":"ตะแบกนา","sci":"Lagerstroemia floribunda","eqn":"GEN","incr":"URBAN"},
  {"id":16,"th":"เสลา","sci":"Lagerstroemia loudonii","eqn":"GEN","incr":"URBAN"},
  {"id":17,"th":"อินทนิลน้ำ","sci":"Lagerstroemia speciosa","eqn":"GEN","incr":"URBAN"},
  {"id":18,"th":"ตะแบกเลือด","sci":"Terminalia mucronata","eqn":"GEN","incr":"SLOW"},
  {"id":19,"th":"นากบุด","sci":"Mesua ferrea","eqn":"GEN","incr":"SLOW"},
  {"id":20,"th":"ไม้สัก","sci":"Tectona grandis","eqn":"GEN","incr":"TEAK"},
  {"id":21,"th":"พะยูง","sci":"Dalbergia cochinchinensis","eqn":"GEN","incr":"SLOW"},
  {"id":22,"th":"ชิงชัน","sci":"Dalbergia oliveri","eqn":"GEN","incr":"SLOW"},
  {"id":23,"th":"กระซิก","sci":"Dalbergia parviflora","eqn":"GEN","incr":"SLOW"},
  {"id":24,"th":"กระพี้เขาควาย","sci":"Dalbergia cultrata","eqn":"GEN","incr":"SLOW"},
  {"id":25,"th":"สาธร","sci":"Millettia leucantha","eqn":"GEN","incr":"SLOW"},
  {"id":26,"th":"แดง","sci":"Xylia xylocarpa var. kerrii","eqn":"GEN","incr":"SLOW"},
  {"id":27,"th":"ประดู่ป่า","sci":"Pterocarpus macrocarpus","eqn":"GEN","incr":"SLOW"},
  {"id":28,"th":"ประดู่บ้าน","sci":"Pterocarpus indicus","eqn":"GEN","incr":"URBAN"},
  {"id":29,"th":"มะค่าโมง","sci":"Afzelia xylocarpa","eqn":"GEN","incr":"SLOW"},
  {"id":30,"th":"มะค่าแต้","sci":"Sindora siamensis","eqn":"GEN","incr":"SLOW"},
  {"id":31,"th":"เคี่ยม","sci":"Cotylelobium lanceolatum","eqn":"GEN","incr":"SLOW"},
  {"id":32,"th":"เคี่ยมคะนอง","sci":"Shorea henryana","eqn":"GEN","incr":"SLOW"},
  {"id":33,"th":"เต็ง","sci":"Shorea obtusa","eqn":"GEN","incr":"SLOW"},
  {"id":34,"th":"รัง","sci":"Shorea siamensis","eqn":"GEN","incr":"SLOW"},
  {"id":35,"th":"พะยอม","sci":"Shorea roxburghii","eqn":"GEN","incr":"SLOW"},
  {"id":36,"th":"ไม้สกุลจำปี","sci":"Magnolia spp.","eqn":"GEN","incr":"URBAN"},
  {"id":37,"th":"จำปีถิ่นไทย","sci":"Magnolia spp. (ถิ่นเดียวของไทย)","eqn":"GEN","incr":"URBAN"},
  {"id":38,"th":"แคนา","sci":"Dolichandrone serrulata","eqn":"GEN","incr":"MULTI"},
  {"id":39,"th":"กัลปพฤกษ์","sci":"Cassia bakeriana","eqn":"GEN","incr":"URBAN"},
  {"id":40,"th":"ราชพฤกษ์","sci":"Cassia fistula","eqn":"GEN","incr":"URBAN"},
  {"id":41,"th":"สุพรรณิการ์","sci":"Cochlospermum religiosum","eqn":"GEN","incr":"URBAN"},
  {"id":42,"th":"เหลืองปรีดียาธร","sci":"Tabebuia aurea","eqn":"GEN","incr":"URBAN"},
  {"id":43,"th":"มะหาด","sci":"Artocarpus lakoocha","eqn":"GEN","incr":"MULTI"},
  {"id":44,"th":"มะขามป้อม","sci":"Phyllanthus emblica","eqn":"GEN","incr":"MULTI"},
  {"id":45,"th":"หว้า","sci":"Syzygium cumini","eqn":"GEN","incr":"MULTI"},
  {"id":46,"th":"จามจุรี","sci":"Samanea saman","eqn":"GEN","incr":"URBAN"},
  {"id":47,"th":"พลับพลา","sci":"Microcos tomentosa","eqn":"GEN","incr":"SLOW"},
  {"id":48,"th":"กันเกรา","sci":"Fagraea fragrans","eqn":"GEN","incr":"SLOW"},
  {"id":49,"th":"กะทังใบใหญ่","sci":"Litsea grandis","eqn":"GEN","incr":"SLOW"},
  {"id":50,"th":"หลุมพอ","sci":"Intsia palembanica","eqn":"GEN","incr":"SLOW"},
  {"id":51,"th":"กฤษณา","sci":"Aquilaria crassna","eqn":"GEN","incr":"MULTI"},
  {"id":52,"th":"ไม้หอม","sci":"Aquilaria spp.","eqn":"GEN","incr":"MULTI"},
  {"id":53,"th":"เทพทาโร","sci":"Cinnamomum porrectum","eqn":"GEN","incr":"MULTI"},
  {"id":54,"th":"ฝาง","sci":"Caesalpinia sappan","eqn":"GEN","incr":"MULTI"},
  {"id":55,"th":"ไผ่ทุกชนิด","sci":"Bambusa / Dendrocalamus / Thyrsostachys spp.","eqn":"BAM1","incr":"BAMBOO"},
  {"id":56,"th":"ไม้สกุลมะม่วง","sci":"Mangifera spp.","eqn":"GEN","incr":"MULTI"},
  {"id":57,"th":"ไม้สกุลทุเรียน","sci":"Durio spp.","eqn":"GEN","incr":"MULTI"},
  {"id":58,"th":"มะขาม","sci":"Tamarindus indica","eqn":"GEN","incr":"MULTI"}
]
```

---

## 6. Data-quality flags (implementers must handle)

1. **R/CF come from the equation group, not the increment group.** The
   `R(2554)`/`CF(2554)` columns in Table 2 are unused by the workbook.
   For all 57 terrestrial species the effective values are `R=0.27`,
   `CF=0.47`. Decide deliberately which set is authoritative; if you
   switch to the 2554 species-specific R/CF, results will diverge from
   the spreadsheet.
2. **`BAMBOO` increment (ΔDBH=1.0, ΔH=1.5) is a FarmFlow assumption**,
   not from the 2554 manual. Flag any bamboo forecast as provisional and
   require real plot measurement before credit issuance.
3. **`DUR` (durian) and `PLM` (palm) groups exist but are unassigned.**
   Species #57 `ไม้สกุลทุเรียน` maps to `GEN`, not `DUR`. `DUR` is a
   level-2 published equation (ลดาวัลย์ 2561) needing TGO approval before
   real use. Don't auto-switch durian to `DUR` without sign-off.
4. **Increment values are group-mean MAI, not TGO-mandated.** Use them
   only for *ex-ante* forecasting. Actual credits require measuring real
   trees at every verification cycle.
5. **`URBAN` ΔDBH is measured at ground level**, not at DBH (1.30 m).
   Note the measurement-height mismatch if you feed it into a DBH-based
   `D2H` predictor.
6. **Species #12 bundles two species** (`สัตบรรณ / ตีนเป็ดทะเล`) under one
   row; split into two records if you need per-species tracking.
7. **Non-permanence buffer = 3%** is applied at project level (Step 10),
   separate from the per-tree calc. Keep it a configurable constant.
8. **`X` for `H`-only / `D`-only groups**: don't compute `D²H`. Respect
   `g.var` strictly, or bamboo/palm results will be wrong.

---

## 7. Reference implementation (Python — matches the workbook)

```python
import math

def predictor(g, D, H):
    if g["var"] == "D2H": return D * D * H
    if g["var"] == "H":   return H
    return D  # "D" or "D0"

def above_ground_kg(g, D, H):
    X  = predictor(g, D, H)
    WS = g["aS"] * X ** g["bS"] if g["aS"] else 0.0
    WB = g["aB"] * X ** g["bB"] if g["aB"] else 0.0
    if   g["WLmode"] == "OGW": WL = 1.0 / (28.0 / (WS + WB) + 0.025)
    elif g["WLmode"] == "POW": WL = g["aL"] * X ** g["bL"]
    else:                      WL = 0.0
    if   g["WTmode"] == "POW": WT = g["aT"] * X ** g["bT"]
    elif g["WTmode"] == "PLM": WT = 6.666 + 12.826 * H ** 0.5 * math.log(H)
    else:                      WT = WS + WB + WL
    return WS, WB, WL, WT

def tco2e_per_tree(g, D, H):
    _, _, _, WT = above_ground_kg(g, D, H)
    bABG  = WT / 1000.0
    bTREE = bABG * (1.0 + g["R"])
    return bTREE * g["CF"] * 44.0 / 12.0

def forecast(g, incr, D1, H1, years=10):
    out, C1 = [], None
    for t in range(1, years + 1):
        Dt = D1 + incr["dDBH"] * (t - 1)
        Ht = H1 + incr["dH"]  * (t - 1)
        Ct = tco2e_per_tree(g, Dt, Ht)
        if t == 1: C1 = Ct
        out.append({"year": t, "D": Dt, "H": Ht,
                    "cumulative_tCO2e": Ct, "delta_tCO2e": Ct - C1})
    return out
```

### Verification values (must reproduce)

| case | inputs | expected |
|------|--------|----------|
| GEN demo | D=15, H=8 | X=1800, WS≈43.138, WB≈7.866, WL≈1.742, WT≈52.747 kg, bTREE≈0.06699 t, tCO2e≈0.11544 |
| GEN per-tree | ตะเคียนทอง D=22, H=14 | tCO2e≈0.4047 → value ≈ 60.71 THB @150 |
| SLOW forecast | GEN eqn, D₁=10, H₁=8 | yr1 C=0.0536 (ΔC=0), yr10 C=0.2550, ΔC=0.2014 |
| Palm | PLM, H=10 | WT≈100.057 kg, tCO2e≈0.2136 |

---

## 8. Config constants

```json
{
  "co2_factor": 3.6666666667,      "//": "44/12",
  "default_carbon_price_thb": 150,
  "non_permanence_buffer": 0.03,   "//": "3% risk reserve, project level",
  "forecast_years": 10,
  "baseline_year": 1,              "//": "registration year, ΔC = 0"
}
```

---

## 9. Source references

- **[1]** อบก. 2559. คู่มืออ้างอิงฯ สาขาป่าไม้และการเกษตร (พิมพ์ครั้งที่ 3)
  — Tables 1–3 (TGO-approved equations, forest-type equations, CF &
  root/shoot).
- **[2]** อบก. & คณะวนศาสตร์ มก. 2554. คู่มือศักยภาพของพรรณไม้ (CDM
  forestry) — Tables 1–4 (carbon content, ΔH/ΔDBH, root/shoot &
  biomass increment, carbon storage).
- **[3]** T-VER-S-TOOL-01-01 Version 02, Appendix 2 — allometric
  equations (per `FarmFlow_Carbon_Calculator_v5`).
- **[4]** ลดาวัลย์ พวงจิตร. 2561. Fruit-tree equations
  (durian/mangosteen/rambutan/longkong) — level-2 published equations,
  require TGO approval before use.
