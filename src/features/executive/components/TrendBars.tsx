import { TREND_COLOR } from '@/features/executive/lib'
import type { MonthPoint } from '@/features/executive/types'

const BAR_MAX = 132 // px — tallest bar; leaves headroom for the current-value label

type Props = {
  title: string
  subtitle: string
  data: MonthPoint[]
  /** Formats a raw value for the tooltip + the current-month direct label. */
  format: (value: number) => string
  /** Bar fill; single series → single hue. Defaults to brand green. */
  color?: string
}

/**
 * Single-series monthly trend as lightweight CSS bars — no chart lib, one hue.
 * Only the latest (current) bar is direct-labelled; the rest reveal their value
 * on hover, per the "selective labels" rule.
 */
export function TrendBars({ title, subtitle, data, format, color = TREND_COLOR }: Props) {
  const max = Math.max(1, ...data.map((m) => m.value))
  const lastIndex = data.length - 1

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>

      <div className="flex items-end justify-between gap-1.5" style={{ minHeight: BAR_MAX + 20 }}>
        {data.map((m, i) => {
          const h = Math.max(3, Math.round((m.value / max) * BAR_MAX))
          const isCurrent = i === lastIndex
          return (
            <div key={m.label} className="flex flex-1 flex-col items-center justify-end">
              {isCurrent && (
                <span className="mb-1 text-[10px] font-semibold tabular-nums text-ink-secondary">
                  {format(m.value)}
                </span>
              )}
              <div
                className="w-full max-w-[26px] rounded-t-md transition-opacity hover:opacity-80"
                style={{
                  height: h,
                  backgroundColor: color,
                  opacity: isCurrent ? 1 : 0.55,
                }}
                title={`${m.label}: ${format(m.value)}`}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-1.5">
        {data.map((m) => (
          <span key={m.label} className="flex-1 text-center text-[10px] text-ink-muted">
            {m.label}
          </span>
        ))}
      </div>
    </section>
  )
}
