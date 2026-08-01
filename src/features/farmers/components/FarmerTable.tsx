'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { formatDate } from '@/lib/utils/format'
import { ContactCell } from '@/features/farmers/components/ContactCell'
import type { Farmer, FarmerAccountStatus } from '@/features/farmers/types'

const PAGE_SIZE = 8

type StatusFilter = 'all' | FarmerAccountStatus

const STATUS_FILTERS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'Active', label: 'ใช้งานอยู่' },
  { value: 'Suspended', label: 'ถูกระงับ' },
]

const SORTS = [
  { value: 'registeredAt', label: 'วันที่ลงทะเบียน' },
  { value: 'fullName', label: 'ชื่อเกษตรกร' },
  { value: 'farmsCount', label: 'จำนวนแปลง' },
]

/**
 * Name first, id second (ADMIN-FARMER-01).
 *
 * The id led the table, so every row opened with a cuid2 that identifies nobody.
 * `fullName` already comes from the DB with a non-PII fallback when a farmer has
 * provided no personal data, so there is always something human to lead with.
 */
const columns: Column<Farmer>[] = [
  {
    key: 'name',
    header: 'ชื่อเกษตรกร',
    cell: (f) => (
      <div className="flex flex-col">
        <Link
          href={`/admin/farmers/${f.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-ink hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
        >
          {f.fullName}
        </Link>
      </div>
    ),
  },
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
    key: 'contact',
    header: 'ข้อมูลติดต่อ',
    cell: (f) => (
      // `phone`/`email` arrive already masked from the API — the real values
      // never cross the network here. Revealing is a separate, audited call
      // (ADMIN-PROJ-03).
      <span onClick={(e) => e.stopPropagation()} role="presentation">
        <ContactCell
          farmerId={f.id}
          phoneMasked={f.phone}
          emailMasked={f.email}
          hasContact={f.hasContact}
        />
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
  const [sort, setSort] = useState('registeredAt')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = farmers.filter((f) => {
      const matchesStatus = status === 'all' || f.accountStatus === status
      // Phone is no longer searchable here: the API masks it, so matching
      // against `08x-xxx-5678` would only ever find the last four digits and
      // quietly miss everything else. Searching by name or id is honest.
      const matchesQuery =
        q === '' || f.fullName.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })

    const pick = (f: Farmer) => {
      switch (sort) {
        case 'fullName':
          return f.fullName
        case 'farmsCount':
          return f.farmsCount
        default:
          return f.registeredAt
      }
    }

    return [...rows].sort((a, b) => {
      const av = pick(a)
      const bv = pick(b)
      if (av === bv) return 0
      return (av < bv ? -1 : 1) * (dir === 'asc' ? 1 : -1)
    })
  }, [farmers, query, status, sort, dir])

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
      <ListToolbar
        q={query}
        onQueryChange={onQuery}
        placeholder="ค้นหาชื่อเกษตรกร หรือ Farmer ID"
        filters={STATUS_FILTERS}
        filterValue={status}
        onFilterChange={(v) => onStatus(v as StatusFilter)}
        filterLabel="สถานะบัญชี"
        sorts={SORTS}
        sortValue={sort}
        dir={dir}
        onSortChange={(s, d) => {
          setSort(s)
          setDir(d)
        }}
      />

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
