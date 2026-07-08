import { Wallet } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { Assumptions, Opportunity } from '@/features/executive/types'

/**
 * Outstanding opportunity — the projected commission still on the table from
 * credits that are certified but not yet sold. The assumption chip keeps the
 * commission rate and market price visible so the number reads as a projection.
 */
export function OpportunityCard({
  opportunity,
  assumptions,
}: {
  opportunity: Opportunity
  assumptions: Assumptions
}) {
  return (
    <section className="rounded-2xl border border-primary-muted bg-primary-subtle p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panel text-primary shadow-sm">
            <Wallet className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">
              มูลค่าโอกาสคงค้าง
            </p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-ink">
                ฿{formatNumber(opportunity.projectedCommissionThb)}
              </span>
              <span className="text-xs font-medium text-ink-muted">ค่าคอมคาดการณ์</span>
            </p>
            <p className="mt-0.5 text-[12px] text-ink-secondary">
              จากคาร์บอนพร้อมขายมูลค่าตลาด ฿{formatNumber(opportunity.sellableValueThb)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-primary-muted bg-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
            ค่าคอมมิชชัน {assumptions.commissionRatePct}%
          </span>
          <span className="inline-flex items-center rounded-full border border-primary-muted bg-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
            ราคา ฿{formatNumber(assumptions.marketPriceThbPerTon)}/ตัน
          </span>
        </div>
      </div>
    </section>
  )
}
