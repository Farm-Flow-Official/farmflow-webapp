import type { ComponentType, ReactNode, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  label: string
  value: string
  sublabel: string
  alert?: boolean
  Icon: IconType
  /**
   * Icon-chip colour classes (bg + text), e.g. 'bg-info-bg text-info', so each
   * KPI can carry a meaningful accent. Defaults to brand green; `alert` still
   * forces the red chip regardless.
   */
  accentClass?: string
  /** Optional micro-visual under the sublabel (e.g. a ratio bar). */
  foot?: ReactNode
}

/**
 * KPI stat card. Clean-tech style: white surface, soft border, subtle hover
 * lift. Alert state stays calm — a small accent dot + tinted icon chip rather
 * than a heavy red border. An optional `accentClass` tints the icon chip per
 * metric, and `foot` hangs a small data-driven visual below the value.
 *
 * Fills its grid cell (`h-full`, column layout) so one card carrying a `foot`
 * does not tower over its neighbours: the row used to look broken because
 * Overlap Flags had a ratio bar and the other three did not (ADMIN-DASH-01).
 * The foot is pushed to the bottom, keeping every value line on the same
 * baseline across the row.
 */
export function KpiCard({
  label,
  value,
  sublabel,
  alert = false,
  Icon,
  accentClass,
  foot,
}: Props) {
  const chip = alert ? 'bg-error-bg text-accent' : (accentClass ?? 'bg-primary-subtle text-primary')

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {label}
            </p>
            {alert && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden
              />
            )}
          </div>

          <p className="mt-3 font-mono text-[28px] font-bold leading-none tracking-tight tabular-nums text-ink">
            {value}
          </p>

          <p className="mt-2 text-[13px] text-ink-secondary">{sublabel}</p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${chip}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>

      {foot && <div className="mt-auto pt-4">{foot}</div>}
    </div>
  )
}
