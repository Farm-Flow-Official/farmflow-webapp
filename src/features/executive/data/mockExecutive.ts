import type { ExecutiveOverview } from '@/features/executive/types'

/**
 * DEMO stand-in for the executive overview until
 * `GET /api/v1/admin/executive/overview` lands. Delete this file once
 * `fetchExecutiveOverview()` calls the real endpoint.
 *
 * Numbers are DETERMINISTIC (a refresh never re-rolls them) and INTERNALLY
 * CONSISTENT so the demo reads honestly:
 *   • funnel decreases left → right (estimated ≥ verified ≥ … ≥ sold)
 *   • available = certified − sold                       (3,200 = 4,500 − 1,300)
 *   • soldCreditsTco2e = funnel.sold                     (1,300)
 *   • availableCreditsTco2e = funnel.available           (3,200)
 *   • projectedRevenueThb = round(0.20 × sold × price)   (0.20 × 1,300 × 300 = 78,000)
 *   • opportunity.sellableValueThb = available × price   (3,200 × 300 = 960,000)
 *   • opportunity.projectedCommissionThb = 0.20 × sellable (192,000)
 *   • each trend's last point = the current snapshot; 2nd-to-last = the KPI prevValue
 */
export const mockExecutive: ExecutiveOverview = {
  headline: {
    projectedRevenueThb: { value: 78_000, prevValue: 71_500 },
    activeFarmers: { value: 1_150, prevValue: 1_090 },
    totalRai: { value: 18_540, prevValue: 17_900 },
    availableCreditsTco2e: { value: 3_200, prevValue: 2_750 },
    soldCreditsTco2e: { value: 1_300, prevValue: 1_150 },
  },
  funnel: {
    estimated: 12_000,
    verified: 8_400,
    submitted: 6_200,
    certified: 4_500,
    available: 3_200,
    sold: 1_300,
  },
  trends: {
    // 12 rolling months ending ก.ค. (the current snapshot).
    revenueByMonth: [
      { label: 'ส.ค.', value: 22_000 },
      { label: 'ก.ย.', value: 26_500 },
      { label: 'ต.ค.', value: 31_000 },
      { label: 'พ.ย.', value: 35_000 },
      { label: 'ธ.ค.', value: 40_000 },
      { label: 'ม.ค.', value: 44_000 },
      { label: 'ก.พ.', value: 49_000 },
      { label: 'มี.ค.', value: 54_000 },
      { label: 'เม.ย.', value: 60_000 },
      { label: 'พ.ค.', value: 66_000 },
      { label: 'มิ.ย.', value: 71_500 },
      { label: 'ก.ค.', value: 78_000 },
    ],
    farmerGrowthByMonth: [
      { label: 'ส.ค.', value: 520 },
      { label: 'ก.ย.', value: 590 },
      { label: 'ต.ค.', value: 655 },
      { label: 'พ.ย.', value: 720 },
      { label: 'ธ.ค.', value: 780 },
      { label: 'ม.ค.', value: 840 },
      { label: 'ก.พ.', value: 900 },
      { label: 'มี.ค.', value: 955 },
      { label: 'เม.ย.', value: 1_005 },
      { label: 'พ.ค.', value: 1_050 },
      { label: 'มิ.ย.', value: 1_090 },
      { label: 'ก.ค.', value: 1_150 },
    ],
    raiGrowthByMonth: [
      { label: 'ส.ค.', value: 12_000 },
      { label: 'ก.ย.', value: 12_900 },
      { label: 'ต.ค.', value: 13_700 },
      { label: 'พ.ย.', value: 14_500 },
      { label: 'ธ.ค.', value: 15_200 },
      { label: 'ม.ค.', value: 15_900 },
      { label: 'ก.พ.', value: 16_500 },
      { label: 'มี.ค.', value: 17_050 },
      { label: 'เม.ย.', value: 17_450 },
      { label: 'พ.ค.', value: 17_700 },
      { label: 'มิ.ย.', value: 17_900 },
      { label: 'ก.ค.', value: 18_540 },
    ],
  },
  opportunity: {
    sellableValueThb: 960_000,
    projectedCommissionThb: 192_000,
  },
  assumptions: {
    commissionRatePct: 20,
    marketPriceThbPerTon: 300,
  },
  asOf: '2026-07-08T00:00:00+07:00',
}
