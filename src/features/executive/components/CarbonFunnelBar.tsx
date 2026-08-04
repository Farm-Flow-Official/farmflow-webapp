import { InfoTooltip } from '@/components/ui/info-tooltip'
import { FUNNEL_STAGES, formatTonnes } from '@/features/executive/lib'
import type { CarbonFunnel } from '@/features/executive/types'

/**
 * The carbon lifecycle as horizontal bars, hand-rolled — no chart library.
 *
 * The fills are an ORDINAL ramp: one hue darkening with depth in the lifecycle.
 * These are ordered categories, so separate hues would burn the colour channel
 * on information the bar length already carries.
 *
 * The last two rows are hollow outlines — real steps in the T-VER lifecycle
 * that this system does not record yet. Dropping them would let "ตรวจรับรองแล้ว"
 * read as the finish line when it is not (ADR 0025).
 */
export function CarbonFunnelBar({ funnel }: { funnel: CarbonFunnel }) {
  const base = Math.max(funnel.estimatedTotal, 0.0001)
  const conversion =
    funnel.estimatedTotal > 0 ? Math.round((funnel.certified / funnel.estimatedTotal) * 100) : 0

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            วงจรคาร์บอน
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            ปริมาณแต่ละสถานะ (tCO₂e) · 1 เครดิต = 1 ตัน
          </p>
        </div>
        <div className="rounded-lg bg-primary-subtle px-3 py-1.5 text-right">
          <span className="text-lg font-bold tabular-nums text-primary">{conversion}%</span>
          <span className="ml-1.5 text-[11px] text-ink-secondary">ประเมิน → ตรวจรับรอง</span>
        </div>
      </div>

      {/* Legend: says what the darkening means, and what a hollow bar means. */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-2.5 w-3 rounded-sm bg-funnel-1" />
            <span className="h-2.5 w-3 rounded-sm bg-funnel-2" />
            <span className="h-2.5 w-3 rounded-sm bg-funnel-3" />
          </span>
          เข้มขึ้น = ลึกขึ้นในวงจร
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-3 rounded-sm border border-dashed"
            style={{ borderColor: 'var(--color-chart-ghost)' }}
            aria-hidden="true"
          />
          ระบบยังไม่บันทึกขั้นนี้
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {FUNNEL_STAGES.map((stage) => {
          const { color } = stage
          const value = color ? funnel[stage.key as keyof CarbonFunnel] : null
          const pct = value === null ? 0 : Math.round((value / base) * 100)

          return (
            <div key={stage.key} className="flex items-center gap-2 sm:gap-3">
              <span className="flex w-[92px] shrink-0 items-center justify-end gap-1 text-right text-[12px] text-ink-secondary sm:w-28">
                <span className={color ? '' : 'text-ink-muted'}>{stage.label}</span>
                <InfoTooltip label={stage.label}>{stage.hint}</InfoTooltip>
              </span>

              <div className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-md bg-sunken">
                {value === null || !color ? (
                  <div
                    className="h-full w-full rounded-md border border-dashed"
                    style={{ borderColor: 'var(--color-chart-ghost)' }}
                  />
                ) : (
                  <div
                    className="h-full rounded-md"
                    // A hairline so a stage that exists but rounds to 0% is still
                    // visibly a stage, not a missing row.
                    style={{ width: `${Math.max(pct, 1.5)}%`, backgroundColor: color }}
                  />
                )}
              </div>

              <span className="w-[86px] shrink-0 text-right text-[12px] tabular-nums sm:w-28">
                {value === null ? (
                  <span className="text-ink-muted">ยังไม่มีข้อมูล</span>
                ) : (
                  <>
                    <span className="font-semibold text-ink">{formatTonnes(value)}</span>
                    <span className="ml-1 hidden text-ink-muted sm:inline">{pct}%</span>
                  </>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {funnel.rejected > 0 && (
        <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
          ในจำนวนที่ประเมินแล้ว มี{' '}
          <span className="font-semibold tabular-nums text-ink-secondary">
            {formatTonnes(funnel.rejected)}
          </span>{' '}
          tCO₂e ที่ผู้ตรวจสอบไม่อนุมัติ
        </p>
      )}
    </section>
  )
}
