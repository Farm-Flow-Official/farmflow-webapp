import { formatNumber } from '@/lib/utils/format'
import { FUNNEL_STAGES } from '@/features/executive/lib'
import type { CarbonFunnel } from '@/features/executive/types'

/**
 * Carbon lifecycle funnel — horizontal bars, one row per stage, length ∝ tonnes.
 * A single-hue green sequential ramp (light → dark) carries stage order; the
 * "% ของประเมิน" on the right tells the conversion story at a glance.
 */
export function CarbonFunnelBar({ funnel }: { funnel: CarbonFunnel }) {
  const max = Math.max(1, funnel.estimated)

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">เส้นทางคาร์บอน</h2>
        <p className="text-xs text-ink-muted">
          ปริมาณคาร์บอนแต่ละสถานะ (tCO₂e) · ประเมิน → ขายแล้ว
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {FUNNEL_STAGES.map((stage) => {
          const tonnes = funnel[stage.key]
          const widthPct = Math.max(2, (tonnes / max) * 100)
          const ofEstimated = Math.round((tonnes / max) * 100)

          return (
            <li key={stage.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-[13px] text-ink-secondary">
                {stage.label}
              </span>

              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-sunken">
                <div
                  className="h-full rounded-md"
                  style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                  title={`${stage.label}: ${formatNumber(tonnes)} tCO₂e (${formatNumber(tonnes)} เครดิต)`}
                />
              </div>

              <span className="w-20 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">
                {formatNumber(tonnes)}
              </span>
              <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
                {ofEstimated}%
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
