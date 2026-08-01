'use client'

import { useEffect, useState } from 'react'
import { ArrowDownUp, Search, X } from 'lucide-react'
import { FilterPills } from '@/components/ui/filter-pills'

export type SortOption = { value: string; label: string }
export type FilterOption = { value: string; label: string }

type Props = {
  q: string
  onQueryChange: (q: string) => void
  placeholder?: string

  filters?: FilterOption[]
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterLabel?: string

  sorts?: SortOption[]
  sortValue?: string
  dir?: 'asc' | 'desc'
  onSortChange?: (sort: string, dir: 'asc' | 'desc') => void

  /** Dim the controls while the server re-queries. */
  pending?: boolean
  /** Extra controls for one list only — e.g. an "anomalies only" switch. */
  extra?: React.ReactNode
}

/**
 * The standard search + filter + sort bar every list gets (GLOBAL-03).
 *
 * Search is debounced: the query round-trips to the server, so firing on every
 * keystroke would queue a request per character and make the table flicker
 * through partial matches. 300ms is long enough to finish a word and short
 * enough not to feel laggy.
 *
 * The local `draft` exists so the input stays responsive while that debounce
 * runs — binding it straight to the URL value would make typing feel sticky.
 */
export function ListToolbar({
  q,
  onQueryChange,
  placeholder = 'ค้นหา…',
  filters,
  filterValue,
  onFilterChange,
  filterLabel,
  sorts,
  sortValue,
  dir = 'desc',
  onSortChange,
  pending = false,
  extra,
}: Props) {
  const [draft, setDraft] = useState(q)
  const [lastQ, setLastQ] = useState(q)

  // Re-sync when the URL changes from outside this component (back button, a
  // cleared filter) — without this the box would keep a stale term. Adjusted
  // during render rather than in an effect: React re-runs this component
  // immediately with the new value instead of painting the stale one first.
  if (q !== lastQ) {
    setLastQ(q)
    setDraft(q)
  }

  useEffect(() => {
    if (draft === q) return
    const timer = setTimeout(() => onQueryChange(draft), 300)
    return () => clearTimeout(timer)
  }, [draft, q, onQueryChange])

  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-2 transition-opacity ${
        pending ? 'opacity-60' : ''
      }`}
    >
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-9 w-full rounded-lg border border-line bg-panel pl-9 pr-9 text-sm text-ink placeholder:text-ink-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {draft && (
          <button
            type="button"
            onClick={() => setDraft('')}
            aria-label="ล้างคำค้นหา"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {filters && filterValue != null && onFilterChange && (
        <FilterPills
          options={filters}
          value={filterValue}
          onChange={onFilterChange}
          ariaLabel={filterLabel}
        />
      )}

      {sorts && sortValue && onSortChange && (
        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
          <label className="sr-only" htmlFor="list-sort">
            เรียงลำดับ
          </label>
          <select
            id="list-sort"
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value, dir)}
            className="h-8 rounded-md bg-transparent px-2 text-sm font-medium text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSortChange(sortValue, dir === 'asc' ? 'desc' : 'asc')}
            title={dir === 'asc' ? 'น้อย → มาก' : 'มาก → น้อย'}
            aria-label={`สลับทิศทางการเรียง (ปัจจุบัน ${dir === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowDownUp className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {extra}
    </div>
  )
}
