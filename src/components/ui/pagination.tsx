'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

/** "Showing X–Y of Z" + prev/next page controls. */
export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  const btn =
    'flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-line bg-panel px-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-panel disabled:hover:text-ink-secondary'

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      <p className="text-[13px] text-ink-secondary">
        Showing <span className="font-medium text-ink">{from}</span>–
        <span className="font-medium text-ink">{to}</span> of{' '}
        <span className="font-medium text-ink">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>

        <span className="px-2 text-[13px] tabular-nums text-ink-secondary">
          {safePage} / {totalPages}
        </span>

        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
