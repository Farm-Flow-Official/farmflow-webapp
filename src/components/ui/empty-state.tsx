import type { ComponentType, ReactNode, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  /** Lucide icon component (rendered in a soft circular chip). */
  icon?: IconType
  title: string
  description?: string
  /** Optional CTA / link rendered below the copy. */
  action?: ReactNode
  className?: string
}

/**
 * Calm, intentional "no data yet" placeholder for a fresh/empty database.
 * Distinct from the in-table `DataTable.empty` (which covers the *filtered*
 * case) — this is the page-level "nothing exists yet" surface. No mock data.
 */
export function EmptyState({ icon: Icon, title, description, action, className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-disabled">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
      )}
      <p className="text-sm font-semibold text-ink-secondary">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
