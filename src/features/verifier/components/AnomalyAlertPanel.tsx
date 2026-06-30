import Link from 'next/link'
import { TriangleAlert, ChevronRight, ShieldCheck } from 'lucide-react'
import type { AnomalyAlert } from '@/features/verifier/types'

export function AnomalyAlertPanel({ alerts }: { alerts: AnomalyAlert[] }) {
  return (
    <section className="rounded-2xl border border-line bg-panel shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-bg text-error">
          <TriangleAlert className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">การแจ้งเตือนความผิดปกติ</h2>
          <p className="text-xs text-ink-muted">batch ที่ระบบ AI flag ไว้ ควรตรวจสอบก่อนรับรอง</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <ShieldCheck className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีรายการผิดปกติ</p>
          <p className="text-[13px] text-ink-muted">ทุก batch ผ่านเกณฑ์ความเชื่อมั่นแล้ว</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {alerts.map((a) => (
            <li key={a.id}>
              <Link
                href={`/verifier/batches/${a.batchId}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-bg text-error">
                  <TriangleAlert className="h-4 w-4" strokeWidth={1.9} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium text-ink">{a.farmName}</span>
                    <span className="font-mono text-xs text-ink-muted">{a.batchId}</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-secondary">{a.reason}</p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
