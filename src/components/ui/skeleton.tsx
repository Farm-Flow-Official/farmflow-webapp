import type { CSSProperties } from 'react'

/**
 * Skeleton primitives for loading states. Built on the design tokens in
 * globals.css — the base block is `--color-sunken` (#F0F2F4) pulsing over the
 * white `--color-panel` surface. The `animate-pulse` is softened for users who
 * prefer reduced motion (see the guard in globals.css).
 *
 * The composed helpers (`SkeletonKpiCard`, `SkeletonTable`) deliberately mirror
 * the geometry of their real counterparts (`KpiCard`, `DataTable`) so the swap
 * from skeleton → content produces no layout shift.
 */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={`block animate-pulse rounded bg-sunken ${className}`}
    />
  )
}

/**
 * Stacked text lines with a graduated width — the last line is shorter, like a
 * real paragraph. Use for labels, descriptions, list rows.
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <span className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </span>
  )
}

/**
 * Mirrors `KpiCard` (src/features/dashboard/components/KpiCard.tsx): white
 * rounded-2xl card, a short label bar, a large value, a sublabel, and the
 * 44px icon chip.
 */
export function SkeletonKpiCard() {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2.5 h-3 w-32" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </div>
  )
}

/** A grid of KPI card skeletons — matches the dashboard KPI row. */
export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonKpiCard key={i} />
      ))}
    </div>
  )
}

/**
 * Mirrors `DataTable` (src/components/ui/data-table.tsx) markup exactly: the
 * bordered white card, the `bg-surface` header, and `h-14` rows with a soft
 * bottom border, so the skeleton table and the real table occupy the same box.
 */
export function SkeletonTable({
  columns = 5,
  rows = 8,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface">
            {Array.from({ length: columns }).map((_, c) => (
              <th
                key={c}
                className="border-b border-line px-4 py-3 text-left"
              >
                <Skeleton className="h-2.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td
                  key={c}
                  className="h-14 border-b border-line px-4 align-middle"
                >
                  <Skeleton
                    className="h-3.5"
                    style={{ width: c === 0 ? '70%' : '50%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
