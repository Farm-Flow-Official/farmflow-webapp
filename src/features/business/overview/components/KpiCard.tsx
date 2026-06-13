import type { ComponentType, SVGProps } from 'react'

type Props = {
  label: string
  value: string
  /** Optional unit/suffix shown smaller next to the value. */
  unit?: string
  sub?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** A single KPI tile for the overview header row. */
export function KpiCard({ label, value, unit, sub, icon: Icon }: Props) {
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
      {sub && <p className="mt-0.5 text-[12px] text-ink-secondary">{sub}</p>}
    </div>
  )
}
