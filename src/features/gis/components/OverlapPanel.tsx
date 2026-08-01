'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Layers, TriangleAlert, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { FARM_STATUS_INFO } from '@/features/farmers/types'
import { FarmDecisionActions } from '@/features/farms/components/FarmDecisionActions'
import { loadOverlapPage } from '@/features/gis/actions/overlapActions'
import type { OverlapPair, OverlapSummary } from '@/features/gis/types/overlap'

const PAGE_SIZE = 10

type Props = {
  summary: OverlapSummary
  initial: OverlapPair[]
  initialTotal: number
  /** Select a farm and fly the map to it. */
  onFocusFarm: (farmId: string) => void
  onClose: () => void
}

/**
 * The overlap worklist (ADMIN-GIS-01).
 *
 * The map alone could show that boundaries clash but gave no way to *find* the
 * clashes or act on them — an admin had to spot red polygons by eye. This lists
 * every overlapping pair worst-first, flies the map to one on click, and offers
 * the same approve/suspend actions as the farm queue, so a dispute can be
 * resolved without leaving the map.
 *
 * Paged from the server: a pilot with thousands of overlaps must not ship them
 * all to the browser to render ten.
 */
export function OverlapPanel({
  summary,
  initial,
  initialTotal,
  onFocusFarm,
  onClose,
}: Props) {
  const [rows, setRows] = useState(initial)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [seriousOnly, setSeriousOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  // Only the newest request may write to state: paging quickly would otherwise
  // let a slow earlier response land last and show the wrong page.
  const requestRef = useRef(0)

  /**
   * Fetching here rather than in an effect: this is a response to a click, not
   * synchronisation with an external system. The first page arrives from the
   * server with the page itself, so nothing needs to run on mount.
   */
  async function load(nextPage: number, nextSeriousOnly: boolean) {
    const token = ++requestRef.current
    setPage(nextPage)
    setSeriousOnly(nextSeriousOnly)
    setLoading(true)
    try {
      const res = await loadOverlapPage({
        limit: PAGE_SIZE,
        offset: (nextPage - 1) * PAGE_SIZE,
        minPercent: nextSeriousOnly ? summary.thresholdPct : undefined,
      })
      if (token !== requestRef.current) return
      setRows(res.rows)
      setTotal(res.total)
    } finally {
      if (token === requestRef.current) setLoading(false)
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-line bg-panel lg:w-[420px]">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Layers className="h-4 w-4 text-error" strokeWidth={1.9} />
            พื้นที่ทับซ้อน
          </h2>
          <p className="mt-1 text-[12px] text-ink-secondary">
            พบ <span className="font-semibold text-ink">{summary.pairs}</span> จุด ·{' '}
            <span className="font-semibold text-error">{summary.flagged}</span> จุดเกิน{' '}
            {summary.thresholdPct}%
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดรายการพื้นที่ทับซ้อน"
          className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </header>

      <div className="border-b border-line px-4 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-secondary">
          <input
            type="checkbox"
            checked={seriousOnly}
            onChange={(e) => load(1, e.target.checked)}
            className="h-4 w-4 rounded border-line text-primary focus:ring-2 focus:ring-primary/30"
          />
          เฉพาะที่เกินเกณฑ์ ({summary.thresholdPct}%)
        </label>
      </div>

      <div className={`flex-1 overflow-y-auto ${loading ? 'opacity-60' : ''}`}>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-ink-muted">
            {seriousOnly ? 'ไม่มีจุดทับซ้อนที่เกินเกณฑ์' : 'ไม่พบพื้นที่ทับซ้อน'}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((pair) => (
              <li key={`${pair.farmA.id}-${pair.farmB.id}`} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onFocusFarm(pair.farmA.id)}
                  className="group flex w-full items-start justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          pair.overlapPercent >= summary.thresholdPct
                            ? 'text-error'
                            : 'text-warning'
                        }`}
                      >
                        {pair.overlapPercent}%
                      </span>
                      <span className="text-[12px] text-ink-muted">
                        ({pair.overlapAreaRai.toFixed(2)} ไร่)
                      </span>
                      {pair.overlapPercent >= summary.thresholdPct && (
                        <TriangleAlert className="h-3.5 w-3.5 text-error" strokeWidth={2} />
                      )}
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-ink">
                      {pair.farmA.name}
                    </span>
                    <span className="block truncate text-[13px] text-ink">
                      {pair.farmB.name}
                    </span>
                  </span>
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-disabled transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>

                {/* Both sides get their own row of actions: resolving an overlap
                    usually means suspending one of the two, not both. */}
                <div className="mt-2 space-y-1.5">
                  {[pair.farmA, pair.farmB].map((side) => (
                    <div
                      key={side.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-2.5 py-2"
                    >
                      <span className="min-w-0">
                        <Link
                          href={`/admin/farms/${side.id}`}
                          className="block truncate text-[12px] font-medium text-primary hover:underline"
                        >
                          {side.name}
                        </Link>
                        <span className="text-[11px] text-ink-muted">{side.ownerName}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Badge variant={FARM_STATUS_INFO[side.status].variant}>
                          {FARM_STATUS_INFO[side.status].label}
                        </Badge>
                        <FarmDecisionActions
                          farmId={side.id}
                          farmName={side.name}
                          farmStatus={side.status}
                          compact
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="border-t border-line px-3">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={(p) => load(p, seriousOnly)}
          />
        </div>
      )}
    </aside>
  )
}
