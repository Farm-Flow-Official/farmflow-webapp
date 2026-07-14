import type { ComponentType, SVGProps } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { deltaPct } from '@/features/executive/lib'
import { Sparkline } from '@/features/executive/components/Sparkline'
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
  /** Tailwind classes for the icon chip, e.g. 'bg-info-bg text-info'. */
  accentClass?: string
  /** 12-month series for the sparkline + hex colour for its stroke/fill. */
  trend?: number[]
  sparkColor?: string
}

/** Headline KPI tile — MoM delta chip, coloured icon chip, and an inline sparkline. */
export function ExecutiveKpiCard({
  label,
  value,
  kpi,
  unit,
  sub,
  icon: Icon,
  accentClass = 'bg-primary-subtle text-primary',
  trend,
  sparkColor = '#34A853',
}: Props) {
  const delta = deltaPct(kpi)
  const up = delta >= 0
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClass}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
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

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-ink-secondary">{sub}</p>}

      {trend && trend.length > 1 && (
        <div className="mt-3">
          <Sparkline data={trend} color={sparkColor} />
        </div>
      )}
    </div>
  )
}
