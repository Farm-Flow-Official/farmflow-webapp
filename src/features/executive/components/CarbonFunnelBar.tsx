import { formatNumber } from '@/lib/utils/format'
import { FUNNEL_STAGES } from '@/features/executive/lib'
import type { CarbonFunnel } from '@/features/executive/types'

/**
 * Carbon lifecycle as horizontal bars (tonnes per stage) — hand-rolled, no chart
 * lib. Bar width is proportional to the largest stage, and each row shows its
 * share of that base so the drop-off from ประเมิน → ขายแล้ว reads at a glance.
 */
export function CarbonFunnelBar({ funnel }: { funnel: CarbonFunnel }) {
  const base = Math.max(1, funnel.estimated)
  const conversion = Math.round((funnel.sold / base) * 100)

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">วงจรคาร์บอน</h2>
          <p className="text-xs text-ink-muted">ปริมาณแต่ละสถานะ (tCO₂e) · 1 เครดิต = 1 ตัน</p>
        </div>
        <div className="rounded-lg bg-primary-subtle px-3 py-1.5 text-right">
          <span className="text-lg font-bold tabular-nums text-primary">{conversion}%</span>
          <span className="ml-1.5 text-[11px] text-ink-secondary">ประเมิน → ขายแล้ว</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {FUNNEL_STAGES.map((s) => {
          const value = funnel[s.key]
          const pct = Math.round((value / base) * 100)
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-[12px] text-ink-secondary">
                {s.label}
              </span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-sunken">
                <div
                  className="flex h-full items-center rounded-md"
                  style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: s.color }}
                  title={`${s.label}: ${formatNumber(value)} tCO₂e (${pct}%)`}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-[12px] tabular-nums">
                <span className="font-semibold text-ink">{formatNumber(value)}</span>
                <span className="ml-1 text-ink-muted">{pct}%</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
