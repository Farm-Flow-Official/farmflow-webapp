import Image from 'next/image'
import { formatDateTime } from '@/lib/utils/format'
import type { ExecutiveScope } from '@/features/executive/types'

/**
 * Whether to show the partner mark beside the FarmFlow one. The board this page
 * serves is FarmFlow's and TRUE's, so the funder is named on it — but a partner
 * relationship ends more often than a dashboard does, hence a flag rather than
 * a hard-coded logo.
 */
const SHOW_PARTNER_LOGO = true

/**
 * Page header.
 *
 * Deliberately states WHEN the numbers were read: this view has no date picker,
 * so without a timestamp a reader cannot tell a fresh figure from a cached one.
 * It also states WHAT they are looking at — under a project scope, every number
 * below changes meaning, and that must never be something you have to infer
 * from the filter control alone.
 */
export function ExecutiveHeader({ asOf, scope }: { asOf: string; scope: ExecutiveScope }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
          ESG Executive Dashboard
        </p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
          {scope ? scope.projectName : 'ภาพรวมพอร์ตคาร์บอน'}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
          {scope && <span className="text-ink">เฉพาะโครงการนี้ · </span>}
          ข้อมูล ณ {formatDateTime(asOf)}
          <span className="text-ink-muted"> · ทุกตัวเลขมาจากฐานข้อมูลจริง</span>
        </p>
      </div>

      {SHOW_PARTNER_LOGO && (
        <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-panel px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Powered by
          </span>
          <Image
            src="/True_Corporation_(Thailand).svg.webp"
            alt="True Corporation"
            width={64}
            height={22}
            className="h-[22px] w-auto"
          />
        </div>
      )}
    </header>
  )
}
