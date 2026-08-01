import { Wrench } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { formatDateTime } from '@/lib/utils/format'
import { LINE_OA_URL } from '@/lib/constants/contact'

/**
 * What a closed dashboard shows instead of itself (ADMIN-SYS-01).
 *
 * Says three things, in order of what the visitor needs: that this is planned
 * rather than broken, why, and when it is back. The reason is the admin's own
 * words — a generic "under maintenance" tells a verifier nothing about whether
 * to wait ten minutes or come back tomorrow.
 */
export function MaintenanceScreen({
  title,
  reason,
  expectedBackAt,
}: {
  title: string
  reason: string | null
  expectedBackAt: string | null
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo size={44} />
          <p className="text-sm text-ink-secondary">FarmFlow Carbon Platform</p>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-8 shadow-sm">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-bg text-warning">
            <Wrench className="h-7 w-7" strokeWidth={1.6} />
          </span>

          <h1 className="text-lg font-semibold text-ink">{title}ปิดปรับปรุงชั่วคราว</h1>

          {reason && (
            <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-secondary">
              {reason}
            </p>
          )}

          {expectedBackAt ? (
            <p className="mt-4 rounded-lg bg-surface px-3 py-2.5 text-[13px] text-ink">
              คาดว่าจะกลับมาใช้งานได้{' '}
              <span className="font-semibold">{formatDateTime(expectedBackAt)}</span>
            </p>
          ) : (
            <p className="mt-4 text-[13px] text-ink-muted">
              ยังไม่มีกำหนดเวลาที่แน่นอน — ขออภัยในความไม่สะดวก
            </p>
          )}

          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            ติดต่อผู้ดูแลระบบ
          </a>
        </div>
      </div>
    </main>
  )
}
