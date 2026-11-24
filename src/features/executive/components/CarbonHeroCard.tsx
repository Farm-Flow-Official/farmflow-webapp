import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { formatNumber } from '@/lib/utils/format'
import { deltaPct, formatTonnes } from '@/features/executive/lib'
import type { ExecutiveKpis, ReductionTarget } from '@/features/executive/types'

/**
 * The one number the board came for, at the size that says so.
 *
 * The progress bar is what turns it from a reading into a judgement: 6 tonnes
 * means nothing until it sits against what the projects said they would deliver.
 * When no live project has filled in its PDD forecast there is no denominator,
 * and the card says that outright instead of drawing an empty bar — a 0% that
 * actually means "no yardstick" is worse than no bar at all.
 *
 * The figure uses proportional digits, not `tabular-nums`: equal-width digits
 * make a display-size number look loose.
 */
export function CarbonHeroCard({
  certified,
  target,
  marketPriceThbPerTon,
}: {
  certified: ExecutiveKpis['certified']
  target: ReductionTarget
  marketPriceThbPerTon: number
}) {
  const delta = deltaPct(certified)
  const up = delta >= 0
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight

  const hasTarget = target.tco2ePerYear > 0
  const pct = hasTarget ? (certified.value / target.tco2ePerYear) * 100 : 0

  return (
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-gradient-to-br from-esg-e-bg via-panel to-panel p-5 shadow-sm sm:p-6">
      <div>
        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          คาร์บอนที่ตรวจรับรองแล้ว
          <InfoTooltip label="คาร์บอนที่ตรวจรับรองแล้ว">
            ผ่านการอนุมัติของผู้ตรวจสอบ FarmFlow แล้ว พร้อมยื่น อบก. — ยังไม่ใช่เครดิตที่ อบก.
            ออกให้ มูลค่าเป็นค่าประเมินจากราคาตลาดที่ตั้งไว้ ไม่ใช่รายได้
          </InfoTooltip>
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[40px] font-bold leading-none tracking-tight text-ink sm:text-[48px]">
            {formatTonnes(certified.value)}
          </span>
          <span className="text-sm font-medium text-ink-secondary">tCO₂e</span>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums ${
              up ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
            }`}
            title="เทียบสิ้นเดือนก่อน"
          >
            <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {up ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
        </div>

        <p className="mt-2 text-[13px] text-ink-secondary">
          มูลค่าประเมิน ฿{formatNumber(certified.estValueThb)}
          <span className="text-ink-muted"> · ที่ ฿{formatNumber(marketPriceThbPerTon)}/ตัน</span>
        </p>
      </div>

      <div>
        {hasTarget ? (
          <>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 text-[12px]">
              <span className="flex items-center gap-1 font-medium text-ink-secondary">
                <Target className="h-3.5 w-3.5" strokeWidth={1.9} />
                ความคืบหน้าเทียบเป้าที่ประกาศไว้
              </span>
              <span className="tabular-nums text-ink-muted">
                {formatTonnes(target.tco2ePerYear)} tCO₂e/ปี
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-sunken"
              role="img"
              aria-label={`คืบหน้า ${pct.toFixed(1)}% ของเป้า ${formatTonnes(target.tco2ePerYear)} ตันต่อปี`}
            >
              <div
                className="h-full rounded-full bg-esg-e"
                // A hairline so a real but tiny share still reads as progress
                // rather than as an empty bar.
                style={{ width: `${Math.min(100, Math.max(pct, 0.8))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[12px] tabular-nums text-ink-secondary">
              {pct < 0.1 && pct > 0 ? '< 0.1' : pct.toFixed(1)}% ของเป้าปีนี้
              {target.projectsMissingTarget > 0 && (
                <span className="text-ink-muted">
                  {' '}
                  · อีก {target.projectsMissingTarget} โครงการยังไม่ได้ตั้งเป้า
                </span>
              )}
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-panel/60 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
              <Target className="h-3.5 w-3.5" strokeWidth={1.9} />
              ยังไม่มีเป้าให้เทียบ
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              โครงการที่เปิดอยู่
              {target.projectsMissingTarget > 0 && ` ${target.projectsMissingTarget} โครงการ`}
              ยังไม่ได้ระบุปริมาณลดคาร์บอนต่อปีใน PDD
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
