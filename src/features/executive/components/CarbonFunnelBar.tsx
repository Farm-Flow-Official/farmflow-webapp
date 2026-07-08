import { formatNumber } from '@/lib/utils/format'
import { FUNNEL_STAGES } from '@/features/executive/lib'
import type { CarbonFunnel } from '@/features/executive/types'

/**
 * Carbon lifecycle as horizontal bars (tonnes per stage) — hand-rolled, no chart
 * lib. Bar width is proportional to the largest stage so the drop-off from
 * ประเมิน → ขายแล้ว reads at a glance.
 */
export function CarbonFunnelBar({ funnel }: { funnel: CarbonFunnel }) {
  const max = Math.max(1, ...FUNNEL_STAGES.map((s) => funnel[s.key]))

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">วงจรคาร์บอน</h2>
        <p className="text-xs text-ink-muted">ปริมาณแต่ละสถานะ (tCO₂e) · 1 เครดิต = 1 ตัน</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {FUNNEL_STAGES.map((s) => {
          const value = funnel[s.key]
          const pct = Math.round((value / max) * 100)
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-[12px] text-ink-secondary">
                {s.label}
              </span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-sunken">
                <div
                  className="flex h-full items-center rounded-md"
                  style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: s.color }}
                  title={`${s.label}: ${formatNumber(value)} tCO₂e`}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-[12px] font-semibold tabular-nums text-ink">
                {formatNumber(value)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
