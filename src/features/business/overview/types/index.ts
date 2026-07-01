import type { PackageCode } from '@/features/business/packages/types'

/**
 * API contract for the Business Overview (P01). The real endpoint returns these
 * server-aggregated shapes directly — Seam: `GET /api/business/overview?from&to`.
 * Aggregated from: subscriptions, payment_slips, payouts, credit_transactions,
 * iot_rentals, leads, users, farms, assessment_sessions, carbon_market_config.
 */

export type OverviewKpis = {
  /** SUM approved `payment_slips.declared_amount_thb` this month. */
  revenueMtdThb: number
  /** Monthly recurring revenue from active subscriptions. */
  mrrThb: number
  /** Count of paid, active subscriptions. */
  activeSubscriptions: number
  /** SUM `farms.calculated_area_rai` (not deleted). */
  totalRai: number
  /** Free → paid conversion, percent. */
  freeToPaidPct: number
  /** SUM `assessment_sessions.total_carbon_kgco2e` / 1000. */
  carbonInSystemTco2e: number
}

/** One month of revenue, split by paid tier (for the stacked trend chart). */
export type RevenueMonth = {
  /** Short Thai month label, e.g. 'ม.ค.'. */
  label: string
  premiumThb: number
  goldThb: number
  platinumThb: number
}

export type TierSlice = {
  code: PackageCode
  name: string
  count: number
}

/** Action queue counts — each links to its page. */
export type PipelineCounts = {
  pendingSlips: number
  pendingPayouts: number
  openTickets: number
  newLeads: number
}

export type ImpactMetrics = {
  carbonInSystemTco2e: number
  farmerCount: number
  /** Estimated community value = carbon × market price (THB). */
  communityValueThb: number
}

export type BusinessOverview = {
  kpis: OverviewKpis
  revenueTrend: RevenueMonth[]
  tierDistribution: TierSlice[]
  pipeline: PipelineCounts
  impact: ImpactMetrics
}
