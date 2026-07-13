'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Boxes, TriangleAlert } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { FilterPills } from '@/components/ui/filter-pills'
import { Pagination } from '@/components/ui/pagination'
import { formatDate } from '@/lib/utils/format'
import { confidenceTextClass } from '@/features/verifier/lib/confidence'
import type { VerificationBatch, BatchStatus } from '@/features/verifier/types'

const PAGE_SIZE = 8

const STATUS_FILTERS: { value: 'all' | BatchStatus; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'Pending', label: 'รอตรวจ' },
  { value: 'Approved', label: 'อนุมัติ' },
  { value: 'Rejected', label: 'ปฏิเสธ' },
]

const STATUS_META: Record<BatchStatus, { variant: BadgeVariant; label: string }> = {
  Pending: { variant: 'pending', label: 'รอตรวจ' },
  Approved: { variant: 'verified', label: 'อนุมัติแล้ว' },
  Rejected: { variant: 'rejected', label: 'ปฏิเสธ' },
}

const columns: Column<VerificationBatch>[] = [
  {
    key: 'id',
    header: 'Batch ID',
    cell: (b) => (
      <span className="rounded bg-surface px-2 py-1 font-mono text-[13px] text-ink-secondary">
        {b.id}
      </span>
    ),
  },
  {
    key: 'farm',
    header: 'ฟาร์ม / เกษตรกร',
    cell: (b) => (
      <div className="flex flex-col">
        <span className="font-medium text-ink">{b.farmName}</span>
        <span className="text-xs text-ink-muted">{b.ownerName}</span>
      </div>
    ),
  },
  {
    key: 'submitted',
    header: 'วันที่ส่ง',
    cell: (b) => (
      <span className="text-[13px] text-ink-secondary">{formatDate(b.submittedAt)}</span>
    ),
  },
  {
    key: 'trees',
    header: 'จำนวนต้น',
    align: 'right',
    cell: (b) => <span className="font-mono tabular-nums text-ink-secondary">{b.treeCount}</span>,
  },
  {
    key: 'confidence',
    header: 'ความเชื่อมั่น AI',
    align: 'right',
    cell: (b) => (
      <span className="inline-flex items-center justify-end gap-1.5">
        {b.anomalyFlag && (
          <>
            <TriangleAlert className="h-3.5 w-3.5 text-error" strokeWidth={1.9} aria-hidden />
            <span className="sr-only">ผิดปกติ</span>
          </>
        )}
        <span className={`font-mono tabular-nums font-semibold ${confidenceTextClass(b.avgConfidence)}`}>
          {Math.round(b.avgConfidence * 100)}%
        </span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'สถานะ',
    cell: (b) => {
      const m = STATUS_META[b.status]
      return (
        <Badge variant={m.variant} dot>
          {m.label}
        </Badge>
      )
    },
  },
]

export function BatchQueueTable({ batches }: { batches: VerificationBatch[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  // Default to the work queue — batches awaiting verification.
  const [status, setStatus] = useState<'all' | BatchStatus>('Pending')
  const [anomalyOnly, setAnomalyOnly] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return batches.filter((b) => {
      const matchesQuery =
        q === '' ||
        b.id.toLowerCase().includes(q) ||
        b.farmName.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || b.status === status
      const matchesAnomaly = !anomalyOnly || b.anomalyFlag
      return matchesQuery && matchesStatus && matchesAnomaly
    })
  }, [batches, query, status, anomalyOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="ค้นหา batch / ฟาร์ม / เกษตรกร"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterPills
            ariaLabel="สถานะ"
            options={STATUS_FILTERS}
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
          />
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
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(b) => b.id}
        onRowClick={(b) => router.push(`/verifier/batches/${b.id}`)}
        empty={{
          icon: <Boxes className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบ batch',
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
