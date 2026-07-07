/**
 * API contract for the Executive Dashboard (mock-first). The real endpoint will
 * return these server-aggregated shapes directly —
 *   Seam: `GET /api/v1/admin/executive/overview?from&to&granularity=month`
 *
 * Aggregated from: users/farmers, farms (calculated_area_rai), assessment_sessions
 * (carbon by lifecycle stage), verifier batches (approvedCount → verified),
 * certification submissions/results (submitted/certified — NOT yet in the API),
 * credit_transactions (sold), carbon_market_config (price), and a commission
 * assumption. Money figures are ESTIMATES by nature — see `projectedRevenueThb`.
 */

/**
 * One metric with its value a period (month) ago, so the UI can render a MoM %
 * without a second round-trip. `prevValue` = same measure at end of last month.
 */
export type Kpi = {
  value: number
  prevValue: number
}

/** One month of a trend series. `label` = short Thai month, e.g. 'ม.ค.'. */
export type MonthPoint = {
  label: string
  value: number
}

export type Headline = {
  /**
   * Cumulative PROJECTED revenue to FarmFlow (THB) =
   *   commissionRatePct × (soldCreditsTco2e × marketPriceThbPerTon).
   * "Projected" because a sale must happen first AND the อบก./farmer split
   * varies per project — FarmFlow can only estimate. Headline number.
   */
  projectedRevenueThb: Kpi
  /** Count of active (registered, not-deleted) farmer accounts. */
  activeFarmers: Kpi
  /** SUM `farms.calculated_area_rai` (not deleted). */
  totalRai: Kpi
  /** Certified credits not yet sold (= certified − sold), in tCO₂e = credits. */
  availableCreditsTco2e: Kpi
  /** Cumulative credits sold to market, in tCO₂e. */
  soldCreditsTco2e: Kpi
}

/**
 * Carbon lifecycle, cumulative to date, in tCO₂e. Monotonically decreasing
 * left→right — each stage is a subset of the one before.
 *   estimated → verified → submitted → certified → available → sold
 * NOTE the domain rule: `verified` (Verifier approved a batch) is NOT `certified`
 * (an external certification body approved the request). FarmFlow submits; it
 * does not issue credits. `available` = `certified` − `sold`.
 */
export type CarbonFunnel = {
  estimated: number
  verified: number
  submitted: number
  certified: number
  available: number
  sold: number
}

export type Trends = {
  /** Cumulative projected revenue by month (THB); last point = headline value. */
  revenueByMonth: MonthPoint[]
  /** Cumulative active farmers by month; last point = headline value. */
  farmerGrowthByMonth: MonthPoint[]
  /** Cumulative total rai by month; last point = headline value. */
  raiGrowthByMonth: MonthPoint[]
}

export type Opportunity = {
  /** Market value of unsold credits = availableCreditsTco2e × price (100%). */
  sellableValueThb: number
  /** FarmFlow's share of that opportunity = commissionRatePct × sellableValue. */
  projectedCommissionThb: number
}

/** Visible, adjustable planning assumptions behind the money figures. */
export type Assumptions = {
  /** FarmFlow commission on credit sales, percent. Default 20 (planning value). */
  commissionRatePct: number
  /** Carbon market price, THB per tCO₂e. */
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
