import type { Metadata } from 'next'
import { Boxes, TriangleAlert, CircleCheck, CircleX } from 'lucide-react'
import { fetchVerifierOverview } from '@/features/verifier/services/fetchVerifierOverview'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { AnomalyAlertPanel } from '@/features/verifier/components/AnomalyAlertPanel'

export const metadata: Metadata = {
  title: 'Verifier Dashboard — FarmFlow',
}

export default async function VerifierDashboardPage() {
  const { summary, alerts } = await fetchVerifierOverview()

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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="รอตรวจรับรอง"
          value={String(summary.pendingReview)}
          sublabel="batch ในคิว"
          Icon={Boxes}
        />
        <KpiCard
          label="แจ้งเตือนผิดปกติ"
          value={String(summary.anomalyAlerts)}
          sublabel="ความเชื่อมั่น AI ต่ำ"
          alert={summary.anomalyAlerts > 0}
          Icon={TriangleAlert}
        />
        <KpiCard
          label="อนุมัติเดือนนี้"
          value={String(summary.approvedThisMonth)}
          sublabel="batch"
          Icon={CircleCheck}
        />
        <KpiCard
          label="ปฏิเสธเดือนนี้"
          value={String(summary.rejectedThisMonth)}
          sublabel="batch"
          Icon={CircleX}
        />
      </div>

      <AnomalyAlertPanel alerts={alerts} />
    </div>
  )
}
