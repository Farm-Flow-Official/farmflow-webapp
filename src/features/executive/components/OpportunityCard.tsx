import { HandCoins, Tag } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { Opportunity, Assumptions } from '@/features/executive/types'

/**
 * Unsold-inventory opportunity — the money still sitting in certified-but-unsold
 * credits — plus the visible planning assumptions (commission %, market price)
 * behind every money figure on the page.
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
      <div className="flex items-center gap-2 text-primary">
        <HandCoins className="h-4 w-4" strokeWidth={1.9} />
        <h2 className="text-base font-semibold">มูลค่าโอกาสคงค้าง</h2>
      </div>
      <p className="mt-1 text-xs text-primary/70">เครดิตที่รับรองแล้วแต่ยังไม่ได้ขาย</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
            มูลค่าเครดิตพร้อมขาย
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
            ฿{formatNumber(opportunity.sellableValueThb)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
            รายได้คาดการณ์ (ส่วนของ FarmFlow)
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
            ฿{formatNumber(opportunity.projectedCommissionThb)}
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary-muted bg-panel px-2.5 py-1.5 text-[11px] text-ink-secondary">
        <Tag className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        <span>
          สมมติค่าคอม <span className="font-semibold text-ink">{assumptions.commissionRatePct}%</span>
          {' · '}ราคา <span className="font-semibold text-ink">฿{formatNumber(assumptions.marketPriceThbPerTon)}</span>/ตัน
        </span>
      </div>
    </section>
  )
}
