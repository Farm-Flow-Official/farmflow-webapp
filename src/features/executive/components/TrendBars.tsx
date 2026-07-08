import { formatNumber } from '@/lib/utils/format'
import type { MonthPoint } from '@/features/executive/types'

const BAR_MAX = 120 // px — bar height; leaves headroom for the value label

type Props = {
  title: string
  subtitle: string
  data: MonthPoint[]
  /** Bar fill colour (hex — inline heights need a raw value). */
  color: string
  /** Formats the small label above each bar. Defaults to grouped number. */
  formatValue?: (n: number) => string
}

/**
 * Single-series monthly trend — lightweight CSS bars, no chart lib. Style lifted
 * from the business overview's RevenueTrendChart so the two dashboards match.
 */
export function TrendBars({ title, subtitle, data, color, formatValue }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const fmt = formatValue ?? formatNumber

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>

      <div className="flex items-end justify-between gap-1.5" style={{ minHeight: BAR_MAX + 24 }}>
        {data.map((d) => {
          const h = Math.round((d.value / max) * BAR_MAX)
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[9px] font-medium tabular-nums text-ink-secondary">
                {fmt(d.value)}
              </span>
              <div
                className="w-full max-w-[26px] rounded-md"
                style={{ height: Math.max(h, 2), backgroundColor: color }}
                title={`${d.label}: ${formatNumber(d.value)}`}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-ink-muted">
            {d.label}
          </span>
        ))}
      </div>
    </section>
  )
}
