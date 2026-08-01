'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, TriangleAlert } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { sessionHref } from '@/features/verifier/lib/routes'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { Pagination } from '@/components/ui/pagination'
import { Carbon } from '@/components/ui/carbon'
import { formatDate } from '@/lib/utils/format'
import { confidenceTextClass } from '@/features/verifier/lib/confidence'
import { BaselineTag } from '@/features/verifier/components/BaselineTag'
import type { VerificationSession, SessionStatus } from '@/features/verifier/types'

const PAGE_SIZE = 8

const STATUS_FILTERS = [
  { value: 'Pending', label: 'รอตรวจ' },
  { value: 'Approved', label: 'อนุมัติ' },
  { value: 'Rejected', label: 'ปฏิเสธ' },
  { value: 'all', label: 'ทุกสถานะ' },
]

const SORTS = [
  { value: 'submittedAt', label: 'วันที่ส่ง' },
  { value: 'farmName', label: 'ชื่อฟาร์ม' },
  { value: 'avgConfidence', label: 'ความเชื่อมั่น AI' },
  { value: 'treeCount', label: 'จำนวนต้น' },
  { value: 'totalCarbonKgCo2e', label: 'คาร์บอน' },
]

const STATUS_META: Record<SessionStatus, { variant: BadgeVariant; label: string }> = {
  Pending: { variant: 'pending', label: 'รอตรวจ' },
  Approved: { variant: 'verified', label: 'อนุมัติแล้ว' },
  Rejected: { variant: 'rejected', label: 'ปฏิเสธ' },
}

/**
 * Farm and farmer lead the row (VERIFIER-SESS-03).
 *
 * The Session ID used to come first, but a verifier scanning the queue is
 * looking for a *place* and a *person* — the id only matters once they have
 * found the row, and reading a cuid2 tells nobody anything.
 */
const columns: Column<VerificationSession>[] = [
  {
    key: 'farm',
    header: 'ฟาร์ม / เกษตรกร',
    cell: (s) => (
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium text-ink">{s.farmName}</span>
          {s.isBaseline && <BaselineTag />}
        </span>
        <span className="truncate text-xs text-ink-muted">{s.ownerName}</span>
      </div>
    ),
  },
  {
    key: 'id',
    header: 'Session ID',
    cell: (s) => (
      <span className="rounded bg-surface px-2 py-1 font-mono text-[13px] text-ink-secondary">
        {s.id}
      </span>
    ),
  },
  {
    key: 'submitted',
    header: 'วันที่ส่ง',
    cell: (s) => (
      <span className="text-[13px] text-ink-secondary">{formatDate(s.submittedAt)}</span>
    ),
  },
  {
    key: 'trees',
    header: 'จำนวนต้น',
    align: 'right',
    cell: (s) => <span className="font-mono tabular-nums text-ink-secondary">{s.treeCount}</span>,
  },
  {
    key: 'carbon',
    header: 'คาร์บอน',
    align: 'right',
    cell: (s) => (
      <span className="text-ink-secondary">
        <Carbon kgCo2e={s.totalCarbonKgCo2e} stacked />
      </span>
    ),
  },
  {
    key: 'confidence',
    header: 'ความเชื่อมั่น AI',
    align: 'right',
    cell: (s) => (
      <span className="inline-flex items-center justify-end gap-1.5">
        {s.anomalyFlag && (
          <>
            <TriangleAlert className="h-3.5 w-3.5 text-error" strokeWidth={1.9} aria-hidden />
            <span className="sr-only">ผิดปกติ</span>
          </>
        )}
        <span
          className={`font-mono tabular-nums font-semibold ${confidenceTextClass(s.avgConfidence)}`}
        >
          {Math.round(s.avgConfidence * 100)}%
        </span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'สถานะ',
    cell: (s) => {
      const m = STATUS_META[s.status]
      return (
        <Badge variant={m.variant} dot>
          {m.label}
        </Badge>
      )
    },
  },
]

export function SessionQueueTable({ sessions }: { sessions: VerificationSession[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  // Default to the work queue — sessions awaiting verification.
  const [status, setStatus] = useState<string>('Pending')
  const [anomalyOnly, setAnomalyOnly] = useState(false)
  const [sort, setSort] = useState('submittedAt')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = sessions.filter((s) => {
      const matchesQuery =
        q === '' ||
        s.id.toLowerCase().includes(q) ||
        s.farmName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || s.status === status
      const matchesAnomaly = !anomalyOnly || s.anomalyFlag
      return matchesQuery && matchesStatus && matchesAnomaly
    })

    const pick = (s: VerificationSession) => {
      switch (sort) {
        case 'farmName':
          return s.farmName
        case 'avgConfidence':
          return s.avgConfidence
        case 'treeCount':
          return s.treeCount
        case 'totalCarbonKgCo2e':
          return s.totalCarbonKgCo2e
        default:
          return s.submittedAt
      }
    }

    return [...rows].sort((a, b) => {
      // Anomalies stay on top whatever the sort — they are the reason a verifier
      // opened this screen, and burying them under a name sort loses them.
      if (a.anomalyFlag !== b.anomalyFlag) return a.anomalyFlag ? -1 : 1
      const av = pick(a)
      const bv = pick(b)
      if (av === bv) return 0
      return (av < bv ? -1 : 1) * (dir === 'asc' ? 1 : -1)
    })
  }, [sessions, query, status, anomalyOnly, sort, dir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        q={query}
        onQueryChange={(v) => {
          setQuery(v)
          setPage(1)
        }}
        placeholder="ค้นหา session / ฟาร์ม / เกษตรกร"
        filters={STATUS_FILTERS}
        filterValue={status}
        onFilterChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        filterLabel="สถานะ"
        sorts={SORTS}
        sortValue={sort}
        dir={dir}
        onSortChange={(s, d) => {
          setSort(s)
          setDir(d)
        }}
        extra={
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary">
            เฉพาะที่ผิดปกติ
            <button
              type="button"
              role="switch"
              aria-checked={anomalyOnly}
              onClick={() => {
                setAnomalyOnly((v) => !v)
                setPage(1)
              }}
              className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                anomalyOnly ? 'bg-primary' : 'bg-ink-disabled'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  anomalyOnly ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        }
      />

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(s) => s.id}
        onRowClick={(s) => router.push(sessionHref(s.projectId, s.id))}
        empty={{
          icon: <Boxes className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบ session',
          description: 'ลองปรับคำค้นหาหรือตัวกรอง',
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  )
}
