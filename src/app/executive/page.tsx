import type { Metadata } from 'next'
import { Banknote, Users, MapPin, Leaf, Coins } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { fetchExecutiveOverview } from '@/features/executive/services/fetchExecutiveOverview'
import { DemoBanner } from '@/features/executive/components/DemoBanner'
import { ExecutiveKpiCard } from '@/features/executive/components/ExecutiveKpiCard'
import { CarbonFunnelBar } from '@/features/executive/components/CarbonFunnelBar'
import { TrendBars } from '@/features/executive/components/TrendBars'
import { OpportunityCard } from '@/features/executive/components/OpportunityCard'

export const metadata: Metadata = {
  title: 'Executive Dashboard — FarmFlow',
}

/** Formats large THB values compactly for trend-bar labels, e.g. 78,000 → '78k'. */
function thbCompact(n: number): string {
  return `${formatNumber(Math.round(n / 1000))}k`
}

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

      {/* ชั้น 1 — Headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ExecutiveKpiCard
          label="รายได้คาดการณ์สะสม"
          value={`฿${formatNumber(headline.projectedRevenueThb.value)}`}
          kpi={headline.projectedRevenueThb}
          sub="จากเครดิตที่ขายแล้ว"
          icon={Banknote}
        />
        <ExecutiveKpiCard
          label="เกษตรกร Active"
          value={formatNumber(headline.activeFarmers.value)}
          kpi={headline.activeFarmers}
          unit="คน"
          icon={Users}
        />
        <ExecutiveKpiCard
          label="พื้นที่ฟาร์มรวม"
          value={formatNumber(headline.totalRai.value)}
          kpi={headline.totalRai}
          unit="ไร่"
          icon={MapPin}
        />
        <ExecutiveKpiCard
          label="คาร์บอนพร้อมขาย"
          value={formatNumber(headline.availableCreditsTco2e.value)}
          kpi={headline.availableCreditsTco2e}
          unit="ตัน"
          sub={`≈ ${formatNumber(headline.availableCreditsTco2e.value)} เครดิต`}
          icon={Leaf}
        />
        <ExecutiveKpiCard
          label="คาร์บอนขายแล้วสะสม"
          value={formatNumber(headline.soldCreditsTco2e.value)}
          kpi={headline.soldCreditsTco2e}
          unit="ตัน"
          sub="สะสมทั้งหมด"
          icon={Coins}
        />
      </div>

      {/* ชั้น 2 — Carbon funnel */}
      <CarbonFunnelBar funnel={funnel} />

      {/* ชั้น 3 — Trends */}
      <TrendBars
        title="รายได้คาดการณ์รายเดือน"
        subtitle="12 เดือนล่าสุด (บาท)"
        data={trends.revenueByMonth}
        color="#004C22"
        formatValue={thbCompact}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendBars
          title="การเติบโตของเกษตรกร"
          subtitle="จำนวนเกษตรกรสะสมรายเดือน (คน)"
          data={trends.farmerGrowthByMonth}
          color="#34A853"
        />
        <TrendBars
          title="การเติบโตของพื้นที่"
          subtitle="พื้นที่ฟาร์มสะสมรายเดือน (ไร่)"
          data={trends.raiGrowthByMonth}
          color="#F59E0B"
        />
      </div>

      {/* ชั้น 4 — Opportunity */}
      <OpportunityCard opportunity={opportunity} assumptions={assumptions} />
    </div>
  )
}
