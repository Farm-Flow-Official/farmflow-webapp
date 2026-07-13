import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  /** Extra classes for the <th>. */
  headerClassName?: string
  /** Extra classes for the <td>. */
  cellClassName?: string
}

type EmptyState = {
  icon?: ReactNode
  title: string
  description?: string
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: EmptyState
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

/**
 * Reusable data grid following the design system: white card, soft border,
 * 56px rows, hover highlight, keyboard-accessible rows when clickable.
 * Used by farmers, payouts, audit log, admin users, etc.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  empty,
}: Props<T>) {
  const clickable = Boolean(onRowClick)

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted ${
                  alignClass[col.align ?? 'left']
                } ${col.headerClassName ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4">
                <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                  {empty?.icon}
                  <p className="text-sm font-semibold text-ink-secondary">
                    {empty?.title ?? 'No results'}
                  </p>
                  {empty?.description && (
                    <p className="text-[13px] text-ink-muted">{empty.description}</p>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? 'button' : undefined}
                className={`group transition-colors ${
                  clickable
                    ? 'cursor-pointer hover:bg-surface focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`h-14 border-b border-line px-4 align-middle text-sm text-ink ${
                      alignClass[col.align ?? 'left']
                    } ${col.cellClassName ?? ''}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
