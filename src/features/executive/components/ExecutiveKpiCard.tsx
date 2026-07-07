import type { ComponentType, SVGProps } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { deltaPct } from '@/features/executive/lib'
import type { Kpi } from '@/features/executive/types'

type Props = {
  label: string
  /** Pre-formatted display value, e.g. '฿81,200' or '1,284'. */
  value: string
  /** Optional unit/suffix shown smaller next to the value. */
  unit?: string
  /** Optional sublabel below the delta. */
  sub?: string
  /** Raw KPI — the card computes and renders its own MoM %. */
  kpi: Kpi
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const DELTA = {
  up: { Icon: TrendingUp, cls: 'text-success' },
  down: { Icon: TrendingDown, cls: 'text-error' },
  flat: { Icon: Minus, cls: 'text-ink-muted' },
} as const

/** Headline KPI tile with a month-over-month delta badge. */
export function ExecutiveKpiCard({ label, value, unit, sub, kpi, icon: Icon }: Props) {
  const { pct, dir } = deltaPct(kpi)
  const { Icon: DeltaIcon, cls } = DELTA[dir]
  const sign = pct > 0 ? '+' : ''

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-center gap-2 text-ink-muted">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>

      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </p>

      <div className="mt-1 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ${cls}`}>
          <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
          {sign}
          {pct}%
        </span>
        <span className="text-[11px] text-ink-muted">จากเดือนก่อน</span>
      </div>

      {sub && <p className="mt-0.5 text-[12px] text-ink-secondary">{sub}</p>}
    </div>
  )
}
