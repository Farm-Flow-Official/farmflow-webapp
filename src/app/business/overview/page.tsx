import type { Metadata } from 'next'
import { Wallet, TrendingUp, Users, Map, Percent } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { fetchBusinessOverview } from '@/features/business/overview/services/fetchBusinessOverview'
import { KpiCard } from '@/features/business/overview/components/KpiCard'
import { RevenueTrendChart } from '@/features/business/overview/components/RevenueTrendChart'
import { TierDonut } from '@/features/business/overview/components/TierDonut'
import { PipelineCards } from '@/features/business/overview/components/PipelineCards'
import { ImpactStrip } from '@/features/business/overview/components/ImpactStrip'

export const metadata: Metadata = {
  title: 'Overview — FarmFlow Business',
}

export default async function OverviewPage() {
  const { kpis, revenueTrend, tierDistribution, pipeline, impact } =
    await fetchBusinessOverview()

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Business Overview
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">ภาพรวมสุขภาพธุรกิจในหน้าจอเดียว</p>
      </header>

      <div className="flex flex-col gap-5">
        {/* KPI row — business health (carbon lives in the Impact band below) */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="รายได้เดือนนี้"
            value={`฿${formatNumber(kpis.revenueMtdThb)}`}
            icon={Wallet}
          />
          <KpiCard label="MRR" value={`฿${formatNumber(kpis.mrrThb)}`} icon={TrendingUp} />
          <KpiCard
            label="สมาชิกที่ใช้งาน"
            value={formatNumber(kpis.activeSubscriptions)}
            icon={Users}
          />
          <KpiCard
            label="พื้นที่รวม"
            value={formatNumber(kpis.totalRai)}
            unit="ไร่"
            icon={Map}
          />
          <KpiCard
            label="Free → Paid"
            value={`${kpis.freeToPaidPct}`}
            unit="%"
            icon={Percent}
          />
        </div>

        {/* Revenue trend + tier donut */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueTrendChart data={revenueTrend} />
          </div>
          <TierDonut data={tierDistribution} />
        </div>

        {/* Action queue */}
        <PipelineCards pipeline={pipeline} />

        {/* Impact */}
        <ImpactStrip impact={impact} />
      </div>
    </div>
  )
}
