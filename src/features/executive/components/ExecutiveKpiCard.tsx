import type { ComponentType, SVGProps } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { deltaPct } from '@/features/executive/lib'
import { Sparkline } from '@/features/executive/components/Sparkline'
import type { Pillar } from '@/features/executive/components/EsgSection'
import type { Kpi } from '@/features/executive/types'

/**
 * The icon chip's colour says which ESG pillar the tile belongs to. That is an
 * encoding, not decoration — it is what keeps a card legible once the reader has
 * scrolled past its section heading.
 */
const PILLAR_STYLE: Record<Pillar, { chip: string; spark: string }> = {
  environmental: { chip: 'bg-esg-e-bg text-esg-e', spark: 'var(--color-esg-e)' },
  social: { chip: 'bg-esg-s-bg text-esg-s', spark: 'var(--color-esg-s)' },
  governance: { chip: 'bg-esg-g-bg text-esg-g', spark: 'var(--color-esg-g)' },
}

type Props = {
  label: string
  /** Pre-formatted headline value (e.g. '6.19' or '1,240'). */
  value: string
  /**
   * Raw KPI — drives the MoM delta chip. Omit it when the metric has no
   * reconstructable baseline; the card then shows nothing rather than a chip
   * derived from an invented prior value.
   */
  kpi?: Kpi
  /** Optional unit shown smaller beside the value. */
  unit?: string
  sub?: string
  /** Explains what the number means; rendered as an info tooltip on the label. */
  hint?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  pillar: Pillar
  /** 12-month series for the sparkline. */
  trend?: number[]
}

/** Supporting KPI tile — optional MoM chip, pillar-coded icon, inline sparkline. */
export function ExecutiveKpiCard({
  label,
  value,
  kpi,
  unit,
  sub,
  hint,
  icon: Icon,
  pillar,
  trend,
}: Props) {
  const delta = kpi ? deltaPct(kpi) : null
  const up = (delta ?? 0) >= 0
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight
  const style = PILLAR_STYLE[pillar]

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.chip}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        {delta !== null && (
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
        )}
      </div>

      <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
        {hint && <InfoTooltip label={label}>{hint}</InfoTooltip>}
      </p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{sub}</p>}

      {trend && trend.length > 1 && (
        <div className="mt-auto pt-3">
          <Sparkline data={trend} color={style.spark} />
        </div>
      )}
    </div>
  )
}
