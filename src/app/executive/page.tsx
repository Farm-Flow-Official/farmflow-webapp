import type { Metadata } from 'next'
import { Banknote, Users, Map, Leaf, Coins } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils/format'
import { fetchExecutiveOverview } from '@/features/executive/services/fetchExecutiveOverview'
import { DemoBanner } from '@/features/executive/components/DemoBanner'
import { ExecutiveKpiCard } from '@/features/executive/components/ExecutiveKpiCard'
import { CarbonFunnelBar } from '@/features/executive/components/CarbonFunnelBar'
import { TrendBars } from '@/features/executive/components/TrendBars'
import { OpportunityCard } from '@/features/executive/components/OpportunityCard'

export const metadata: Metadata = {
  title: 'Executive Dashboard — FarmFlow',
}

const baht = (v: number) => `฿${formatNumber(v)}`

export default async function ExecutiveDashboardPage() {
  const data = await fetchExecutiveOverview()
  const { headline, funnel, trends, opportunity, assumptions } = data

  const kpiCards = [
    {
      label: 'รายได้คาดการณ์สะสม',
      value: baht(headline.projectedRevenueThb.value),
      kpi: headline.projectedRevenueThb,
      sub: 'จากเครดิตที่ขายแล้ว (ประเมิน)',
      icon: Banknote,
    },
    {
      label: 'เกษตรกร Active',
      value: formatNumber(headline.activeFarmers.value),
      unit: 'คน',
      kpi: headline.activeFarmers,
      icon: Users,
    },
    {
      label: 'พื้นที่ฟาร์มรวม',
      value: formatNumber(headline.totalRai.value),
      unit: 'ไร่',
      kpi: headline.totalRai,
      icon: Map,
    },
    {
      label: 'คาร์บอนพร้อมขาย',
      value: formatNumber(headline.availableCreditsTco2e.value),
      unit: 'ตัน',
      kpi: headline.availableCreditsTco2e,
      sub: `${formatNumber(headline.availableCreditsTco2e.value)} เครดิต`,
      icon: Leaf,
    },
    {
      label: 'คาร์บอนขายแล้วสะสม',
      value: formatNumber(headline.soldCreditsTco2e.value),
      unit: 'ตัน',
      kpi: headline.soldCreditsTco2e,
      sub: 'เครดิตที่ขายสู่ตลาด',
      icon: Coins,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <DemoBanner />

      <header>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
          สุขภาพธุรกิจโดยรวม
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          ข้อมูล ณ {formatDate(data.asOf)} · เทียบเดือนก่อนหน้า (MoM)
        </p>
      </header>

      {/* Row A — headline KPIs */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpiCards.map((card) => (
            <ExecutiveKpiCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Row B — funnel + revenue trend */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CarbonFunnelBar funnel={funnel} />
        <TrendBars
          title="รายได้คาดการณ์สะสม"
          subtitle="รายเดือน · 12 เดือนล่าสุด (บาท)"
          data={trends.revenueByMonth}
          format={baht}
        />
      </section>

      {/* Row C — growth trends */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendBars
          title="การเติบโตเกษตรกร"
          subtitle="สะสมรายเดือน · 12 เดือนล่าสุด (คน)"
          data={trends.farmerGrowthByMonth}
          format={formatNumber}
        />
        <TrendBars
          title="การเติบโตพื้นที่"
          subtitle="สะสมรายเดือน · 12 เดือนล่าสุด (ไร่)"
          data={trends.raiGrowthByMonth}
          format={formatNumber}
        />
      </section>

      {/* Row D — opportunity + assumptions */}
      <section>
        <OpportunityCard opportunity={opportunity} assumptions={assumptions} />
      </section>
    </div>
  )
}
