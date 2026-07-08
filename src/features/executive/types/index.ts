/**
 * API contract for the Executive Overview (internal C-level dashboard).
 *
 * DEMO-first: today this shape is served from a local mock so executives can
 * validate the KPI set BEFORE the backend aggregation is built. The real
 * endpoint is expected to return this exact shape server-aggregated —
 *   Seam: `GET /api/v1/admin/executive/overview?from&to&granularity=month`
 * Aggregated from: assessment_sessions, credit_transactions, farms, users,
 * carbon_market_config. When the endpoint lands, only the service body changes;
 * every field below keeps its meaning so the UI never moves.
 */

/** A single metric with its prior-period value, so the UI can render MoM %. */
export type Kpi = {
  /** Current-period value. */
  value: number
  /** Previous-period value (MoM baseline). `deltaPct()` derives the arrow. */
  prevValue: number
}

/** One month on a trend line. `label` is a short Thai month, e.g. 'ก.ค.'. */
export type MonthPoint = {
  label: string
  value: number
}

/** The five headline tiles. Each carries a prior value for the MoM chip. */
export type Headline = {
  /** Cumulative projected revenue = commissionRate × (soldCredits × price). */
  projectedRevenueThb: Kpi
  /** Farmers with activity in the period. */
  activeFarmers: Kpi
  /** SUM farm area (rai). */
  totalRai: Kpi
  /** Credits certified but not yet sold, in tCO₂e (1 credit = 1 tCO₂e). */
  availableCreditsTco2e: Kpi
  /** Cumulative sold credits, in tCO₂e. */
  soldCreditsTco2e: Kpi
}

/**
 * Carbon lifecycle, tonnes (tCO₂e) per stage, ordered many → few. Verifier
 * approval yields `verified`; `certified` is an EXTERNAL outcome (อบก. approves)
 * — a verifier cannot issue credits. `available = certified − sold`.
 */
export type CarbonFunnel = {
  /** ประเมิน — carbon estimated from assessments. */
  estimated: number
  /** ตรวจสอบแล้ว — approved by a FarmFlow verifier. */
  verified: number
  /** ยื่นขอรับรอง — submitted for external certification. */
  submitted: number
  /** รับรองแล้ว — certified as credits by the external body. */
  certified: number
  /** พร้อมขาย — certified minus sold. */
  available: number
  /** ขายแล้ว — sold credits (cumulative). */
  sold: number
}

export type Trends = {
  revenueByMonth: MonthPoint[]
  farmerGrowthByMonth: MonthPoint[]
  raiGrowthByMonth: MonthPoint[]
}

export type Opportunity = {
  /** Gross market value of sellable credits = available × price. */
  sellableValueThb: number
  /** FarmFlow's projected cut of that = commissionRate × sellableValue. */
  projectedCommissionThb: number
}

/** Surfaced as an on-screen chip so the numbers read as assumptions, not fact. */
export type Assumptions = {
  /** FarmFlow commission on carbon sales, percent (default 20). */
  commissionRatePct: number
  /** Market price per tonne, THB. */
  marketPriceThbPerTon: number
}

export type ExecutiveOverview = {
  headline: Headline
  funnel: CarbonFunnel
  trends: Trends
  opportunity: Opportunity
  assumptions: Assumptions
  /** ISO timestamp the snapshot represents. */
  asOf: string
}
