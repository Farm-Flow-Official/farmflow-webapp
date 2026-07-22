import type { Metadata } from 'next'
import { Boxes, TriangleAlert, CircleCheck, CircleX, TreePine } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import { fetchVerifierOverview } from '@/features/verifier/services/fetchVerifierOverview'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { ReviewDistributionBar } from '@/features/verifier/components/ReviewDistributionBar'
import { AnomalyAlertPanel } from '@/features/verifier/components/AnomalyAlertPanel'

export const metadata: Metadata = {
  title: 'Verifier Dashboard — FarmFlow',
}

export default async function VerifierDashboardPage() {
  const { summary, alerts } = await fetchVerifierOverview()

  const kpiCards = [
    {
      label: 'รอตรวจรับรอง',
      value: String(summary.pendingReview),
      sublabel: 'batch ในคิว',
      alert: summary.pendingReview > 0,
      Icon: Boxes,
      accentClass: 'bg-warning-bg text-warning',
    },
    {
      label: 'แจ้งเตือนผิดปกติ',
      value: String(summary.anomalyAlerts),
      sublabel: 'ความเชื่อมั่น AI ต่ำ',
      alert: summary.anomalyAlerts > 0,
      Icon: TriangleAlert,
      accentClass: 'bg-error-bg text-error',
    },
    {
      label: 'อนุมัติเดือนนี้',
      value: String(summary.approvedThisMonth),
      sublabel: 'batch',
      alert: false,
      Icon: CircleCheck,
      accentClass: 'bg-success-bg text-success',
    },
    {
      label: 'ปฏิเสธเดือนนี้',
      value: String(summary.rejectedThisMonth),
      sublabel: 'batch',
      alert: false,
      Icon: CircleX,
      accentClass: 'bg-error-bg text-error',
    },
    {
      label: 'ต้นไม้ที่ประเมิน',
      value: formatNumber(summary.totalTreesAssessed),
      sublabel: 'ภาพที่ AI ตรวจสะสม',
      alert: false,
      Icon: TreePine,
      accentClass: 'bg-info-bg text-info',
    },
  ]

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Verifier Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ภาพรวมการตรวจรับรองข้อมูลคาร์บอน (MRV)
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <KpiCard {...card} />
          </div>
        ))}
      </div>

      <div className="mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <ReviewDistributionBar
          pending={summary.pendingReview}
          approved={summary.approvedThisMonth}
          rejected={summary.rejectedThisMonth}
        />
      </div>

      <AnomalyAlertPanel alerts={alerts} />
    </div>
  )
}
