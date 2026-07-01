import type { BusinessOverview } from '@/features/business/overview/types'

/**
 * Temporary stand-in for the aggregated business overview until
 * `/api/business/overview` lands. Delete this file once
 * `fetchBusinessOverview()` calls the real endpoint. Numbers are kept internally
 * consistent (tiers sum to farmerCount; carbon × ฿200 = community value;
 * pendingSlips matches the Payments queue) so the demo reads honestly.
 */
export const mockOverview: BusinessOverview = {
  kpis: {
    revenueMtdThb: 195_000,
    mrrThb: 186_200,
    activeSubscriptions: 412,
    totalRai: 18_540,
    freeToPaidPct: 35.8,
    carbonInSystemTco2e: 1_284,
  },
  revenueTrend: [
    { label: 'ม.ค.', premiumThb: 38_000, goldThb: 45_000, platinumThb: 27_000 },
    { label: 'ก.พ.', premiumThb: 42_000, goldThb: 50_000, platinumThb: 27_000 },
    { label: 'มี.ค.', premiumThb: 46_000, goldThb: 55_000, platinumThb: 36_000 },
    { label: 'เม.ย.', premiumThb: 52_000, goldThb: 60_000, platinumThb: 36_000 },
    { label: 'พ.ค.', premiumThb: 58_000, goldThb: 70_000, platinumThb: 45_000 },
    { label: 'มิ.ย.', premiumThb: 62_000, goldThb: 80_000, platinumThb: 53_000 },
  ],
  tierDistribution: [
    { code: 'FREE', name: 'Free', count: 738 },
    { code: 'PREMIUM', name: 'Premium', count: 248 },
    { code: 'GOLD', name: 'Gold', count: 126 },
    { code: 'PLATINUM', name: 'Platinum', count: 38 },
  ],
  pipeline: {
    pendingSlips: 6,
    pendingPayouts: 3,
    openTickets: 4,
    newLeads: 7,
  },
  impact: {
    carbonInSystemTco2e: 1_284,
    farmerCount: 1_150,
    communityValueThb: 256_800,
  },
}
