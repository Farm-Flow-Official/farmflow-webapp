import type { ComponentType, SVGProps } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { deltaPct } from '@/features/executive/lib'
import type { Kpi } from '@/features/executive/types'

type Props = {
  label: string
  /** Pre-formatted headline value (e.g. '฿78,000' or '3,200'). */
  value: string
  /** Raw KPI — drives the MoM delta chip. */
  kpi: Kpi
  /** Optional unit shown smaller beside the value. */
  unit?: string
  sub?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Headline KPI tile with a month-over-month delta chip. */
export function ExecutiveKpiCard({ label, value, kpi, unit, sub, icon: Icon }: Props) {
  const delta = deltaPct(kpi)
  const up = delta >= 0
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-muted">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
          <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
            up ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
          }`}
          title="เทียบเดือนก่อน (MoM)"
        >
          <DeltaIcon className="h-3 w-3" strokeWidth={2.2} />
          {up ? '+' : ''}
          {delta.toFixed(1)}%
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-ink-secondary">{sub}</p>}
    </div>
  )
}
