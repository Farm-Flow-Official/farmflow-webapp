import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  label: string
  value: string
  sublabel: string
  alert?: boolean
  Icon: IconType
}

/**
 * KPI stat card. Clean-tech style: white surface, soft border, subtle hover
 * lift. Alert state stays calm — a small accent dot + tinted icon chip rather
 * than a heavy red border.
 */
export function KpiCard({ label, value, sublabel, alert = false, Icon }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
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

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            alert ? 'bg-error-bg' : 'bg-primary-subtle'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${alert ? 'text-accent' : 'text-primary'}`}
            strokeWidth={1.75}
          />
        </div>
      </div>
    </div>
  )
}
