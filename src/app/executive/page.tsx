import type { Metadata } from 'next'
import { Users, MapPin, Leaf, Coins } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { fetchExecutiveOverview } from '@/features/executive/services/fetchExecutiveOverview'
import { DemoBanner } from '@/features/executive/components/DemoBanner'
import { ExecutiveKpiCard } from '@/features/executive/components/ExecutiveKpiCard'
import { RevenueHeroCard } from '@/features/executive/components/RevenueHeroCard'
import { CarbonFunnelBar } from '@/features/executive/components/CarbonFunnelBar'
import { OpportunityCard } from '@/features/executive/components/OpportunityCard'

export const metadata: Metadata = {
  title: 'Executive Dashboard — FarmFlow',
}

const vals = (series: { value: number }[]) => series.map((p) => p.value)

export default async function ExecutivePage() {
  const { headline, funnel, trends, opportunity, assumptions } =
    await fetchExecutiveOverview()

  return (
    <div className="flex flex-col gap-6">
      <DemoBanner />

      <header>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Executive Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          สุขภาพธุรกิจโดยรวม — รายได้ เกษตรกร พื้นที่ และวงจรคาร์บอน (เทียบเดือนก่อน)
        </p>
      </header>

      {/* ชั้น 1 — Hero revenue + supporting KPIs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueHeroCard data={trends.revenueByMonth} kpi={headline.projectedRevenueThb} />

        <div className="grid grid-cols-2 gap-4">
          <ExecutiveKpiCard
            label="เกษตรกร Active"
            value={formatNumber(headline.activeFarmers.value)}
            kpi={headline.activeFarmers}
            unit="คน"
            icon={Users}
            accentClass="bg-info-bg text-info"
            trend={vals(trends.farmerGrowthByMonth)}
            sparkColor="#2563EB"
          />
          <ExecutiveKpiCard
            label="พื้นที่ฟาร์มรวม"
            value={formatNumber(headline.totalRai.value)}
            kpi={headline.totalRai}
            unit="ไร่"
            icon={MapPin}
            accentClass="bg-warning-bg text-warning"
            trend={vals(trends.raiGrowthByMonth)}
            sparkColor="#D97706"
          />
          <ExecutiveKpiCard
            label="คาร์บอนพร้อมขาย"
            value={formatNumber(headline.availableCreditsTco2e.value)}
            kpi={headline.availableCreditsTco2e}
            unit="ตัน"
            sub={`≈ ${formatNumber(headline.availableCreditsTco2e.value)} เครดิต`}
            icon={Leaf}
            accentClass="bg-primary-subtle text-primary"
            trend={vals(trends.availableCreditsByMonth)}
            sparkColor="#16A34A"
          />
          <ExecutiveKpiCard
            label="คาร์บอนขายแล้วสะสม"
            value={formatNumber(headline.soldCreditsTco2e.value)}
            kpi={headline.soldCreditsTco2e}
            unit="ตัน"
            sub="สะสมทั้งหมด"
            icon={Coins}
            accentClass="bg-success-bg text-success"
            trend={vals(trends.soldCreditsByMonth)}
            sparkColor="#166534"
          />
        </div>
      </div>

      {/* ชั้น 2 — Carbon funnel */}
      <CarbonFunnelBar funnel={funnel} />

      {/* ชั้น 3 — Opportunity */}
      <OpportunityCard opportunity={opportunity} assumptions={assumptions} />
    </div>
  )
}
