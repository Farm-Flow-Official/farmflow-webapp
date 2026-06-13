import { formatNumber } from '@/lib/utils/format'
import { TIER_COLORS } from '@/features/business/overview/lib'
import type { TierSlice } from '@/features/business/overview/types'

/** Tier distribution as a CSS conic-gradient donut + legend. */
export function TierDonut({ data }: { data: TierSlice[] }) {
  const total = Math.max(1, data.reduce((sum, s) => sum + s.count, 0))

  // Build conic-gradient stops from cumulative percentages.
  let acc = 0
  const stops = data
    .map((s) => {
      const start = (acc / total) * 100
      acc += s.count
      const end = (acc / total) * 100
      return `${TIER_COLORS[s.code]} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <h2 className="text-base font-semibold text-ink">สัดส่วนแพ็กเกจ</h2>
      <p className="text-xs text-ink-muted">ผู้ใช้ทั้งหมด {formatNumber(total)} ราย</p>

      <div className="mt-4 flex items-center gap-5">
        <div
          className="relative h-28 w-28 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label="แผนภูมิวงกลมสัดส่วนแพ็กเกจ"
        >
          <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-panel">
            <span className="text-lg font-bold leading-none text-ink">{formatNumber(total)}</span>
            <span className="text-[10px] text-ink-muted">ราย</span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          {data.map((s) => {
            const pct = Math.round((s.count / total) * 100)
            return (
              <li key={s.code} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: TIER_COLORS[s.code] }}
                />
                <span className="flex-1 text-ink-secondary">{s.name}</span>
                <span className="font-mono text-[13px] tabular-nums text-ink">
                  {formatNumber(s.count)}
                </span>
                <span className="w-9 text-right font-mono text-[12px] tabular-nums text-ink-muted">
                  {pct}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
