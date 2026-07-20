'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { formatDate, formatPhone } from '@/lib/utils/format'
import type { Farmer, FarmerAccountStatus } from '@/features/farmers/types'

const PAGE_SIZE = 8

type StatusFilter = 'all' | FarmerAccountStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
]

const columns: Column<Farmer>[] = [
  {
    key: 'id',
    header: 'Farmer ID',
    cell: (f) => (
      <span className="rounded bg-surface px-2 py-1 font-mono text-[13px] text-ink-secondary">
        {f.id}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    cell: (f) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1 flex-wrap">
          <Link
            href={`/admin/farmers/${f.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-ink hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
          >
            {f.fullName}
          </Link>
        </div>
        {f.email && <span className="text-xs text-ink-muted">{f.email}</span>}
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (f) => (
      <span className="font-mono text-[13px] text-ink-secondary">
        {f.phone ? formatPhone(f.phone) : <span className="text-ink-disabled">—</span>}
      </span>
    ),
  },
  {
    key: 'farms',
    header: 'Farms',
    align: 'right',
    cell: (f) => <span className="font-mono tabular-nums">{f.farmsCount}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (f) => (
      <Badge variant={f.accountStatus === 'Active' ? 'verified' : 'neutral'} dot>
        {f.accountStatus}
      </Badge>
    ),
  },
  {
    key: 'registered',
    header: 'Registered',
    cell: (f) => (
      <span className="text-[13px] text-ink-secondary">
        {formatDate(f.registeredAt)}
      </span>
    ),
  },
]

export function FarmerTable({ farmers }: { farmers: Farmer[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = q.replace(/\D/g, '')
    return farmers.filter((f) => {
      const matchesStatus = status === 'all' || f.accountStatus === status
      const matchesQuery =
        q === '' ||
        f.fullName.toLowerCase().includes(q) ||
        // Only match on phone when the query has digits — otherwise
        // `''.includes('')` is true and every row leaks through.
        (qDigits !== '' && f.phone != null && f.phone.replace(/\D/g, '').includes(qDigits)) ||
        f.id.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [farmers, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to first page whenever the result set changes.
  function onQuery(v: string) {
    setQuery(v)
    setPage(1)
  }
  function onStatus(v: StatusFilter) {
    setStatus(v)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="ค้นหาชื่อ เบอร์ หรือ ID"
            data-search-input
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onStatus(f.value)}
              className={`h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                status === f.value
                  ? 'bg-primary-subtle text-primary'
                  : 'text-ink-secondary hover:bg-surface hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(f) => f.id}
        onRowClick={(f) => router.push(`/admin/farmers/${f.id}`)}
        empty={{
          icon: <Users className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบเกษตรกร',
          description: 'ลองปรับคำค้นหาหรือตัวกรองสถานะ',
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
