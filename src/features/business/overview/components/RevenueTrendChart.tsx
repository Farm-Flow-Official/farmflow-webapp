import { formatNumber } from '@/lib/utils/format'
import { TIER_COLORS } from '@/features/business/overview/lib'
import type { RevenueMonth } from '@/features/business/overview/types'

const BAR_MAX = 140 // px — bar height; leaves headroom for the value label

const SERIES = [
  { key: 'platinumThb', label: 'Platinum', color: TIER_COLORS.PLATINUM },
  { key: 'goldThb', label: 'Gold', color: TIER_COLORS.GOLD },
  { key: 'premiumThb', label: 'Premium', color: TIER_COLORS.PREMIUM },
] as const

function monthTotal(m: RevenueMonth): number {
  return m.premiumThb + m.goldThb + m.platinumThb
}

/** Stacked monthly revenue by tier — lightweight CSS bars, no chart lib. */
export function RevenueTrendChart({ data }: { data: RevenueMonth[] }) {
  const max = Math.max(1, ...data.map(monthTotal))

  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">รายได้รายเดือน</h2>
          <p className="text-xs text-ink-muted">แยกตามแพ็กเกจ · 6 เดือนล่าสุด (บาท)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3" style={{ minHeight: BAR_MAX + 24 }}>
        {data.map((m) => {
          const total = monthTotal(m)
          return (
            <div key={m.label} className="flex flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[10px] font-medium tabular-nums text-ink-secondary">
                {formatNumber(Math.round(total / 1000))}k
              </span>
              <div
                className="relative flex w-full max-w-[40px] flex-col overflow-hidden rounded-md"
                title={`${m.label}: ฿${formatNumber(total)}`}
              >
                {SERIES.map((s) => {
                  const value = m[s.key]
                  const h = Math.round((value / max) * BAR_MAX)
                  if (h <= 0) return null
                  return (
                    <div
                      key={s.key}
                      style={{ height: h, backgroundColor: s.color }}
                      className="w-full"
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        {data.map((m) => (
          <span key={m.label} className="flex-1 text-center text-[11px] text-ink-muted">
            {m.label}
          </span>
        ))}
      </div>
    </section>
  )
}
