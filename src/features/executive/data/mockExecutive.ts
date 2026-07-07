import type { ExecutiveOverview } from '@/features/executive/types'

/**
 * Temporary stand-in for the aggregated executive overview until
 * `GET /api/v1/admin/executive/overview` lands. Delete this file once
 * `fetchExecutiveOverview()` calls the real endpoint.
 *
 * Numbers are deterministic (refresh → no change) and internally consistent, so
 * the demo reads honestly:
 *   - funnel decreases monotonically (estimated ≥ … ≥ sold)
 *   - available = certified − sold
 *   - headline.soldCreditsTco2e = funnel.sold; availableCredits = funnel.available
 *   - projectedRevenueThb = 20% × sold × price ; opportunity = 20% × available × price
 *   - each trend's last point = its headline value
 */

const COMMISSION_RATE_PCT = 20
const PRICE_THB_PER_TON = 280

const SOLD = 1_450
const AVAILABLE = 2_150
const CERTIFIED = AVAILABLE + SOLD // 3,600 — enforces available = certified − sold

const round = (n: number) => Math.round(n)
const commission = (tonnes: number) =>
  round((COMMISSION_RATE_PCT / 100) * tonnes * PRICE_THB_PER_TON)

// 12 months ending ก.ค. (current). Cumulative growth curves; last = snapshot.
const MONTHS = ['ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'] as const

const REVENUE_CUM = [8_000, 13_000, 19_000, 25_000, 32_000, 40_000, 47_000, 54_000, 61_000, 68_000, 74_500, commission(SOLD)]
const FARMERS_CUM = [420, 510, 590, 665, 740, 820, 910, 995, 1_080, 1_150, 1_218, 1_284]
const RAI_CUM = [7_200, 8_400, 9_500, 10_600, 11_800, 12_900, 14_000, 15_100, 16_200, 17_200, 17_900, 18_540]

const series = (values: readonly number[]) =>
  MONTHS.map((label, i) => ({ label, value: values[i] }))

// prevValue = second-to-last cumulative point → drives the MoM % on each card.
const prev = <T extends readonly number[]>(arr: T) => arr[arr.length - 2]
const last = <T extends readonly number[]>(arr: T) => arr[arr.length - 1]

export const mockExecutive: ExecutiveOverview = {
  headline: {
    projectedRevenueThb: { value: last(REVENUE_CUM), prevValue: prev(REVENUE_CUM) },
    activeFarmers: { value: last(FARMERS_CUM), prevValue: prev(FARMERS_CUM) },
    totalRai: { value: last(RAI_CUM), prevValue: prev(RAI_CUM) },
    availableCreditsTco2e: { value: AVAILABLE, prevValue: 1_980 },
    soldCreditsTco2e: { value: SOLD, prevValue: 1_300 },
  },
  funnel: {
    estimated: 12_500,
    verified: 8_200,
    submitted: 5_400,
    certified: CERTIFIED,
    available: AVAILABLE,
    sold: SOLD,
  },
  trends: {
    revenueByMonth: series(REVENUE_CUM),
    farmerGrowthByMonth: series(FARMERS_CUM),
    raiGrowthByMonth: series(RAI_CUM),
  },
  opportunity: {
    sellableValueThb: AVAILABLE * PRICE_THB_PER_TON,
    projectedCommissionThb: commission(AVAILABLE),
  },
  assumptions: {
    commissionRatePct: COMMISSION_RATE_PCT,
    marketPriceThbPerTon: PRICE_THB_PER_TON,
  },
  asOf: '2026-07-08T00:00:00+07:00',
}
