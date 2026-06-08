'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Wallet } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { maskAccountNumber } from '@/features/payouts/utils/maskAccountNumber'
import type { PayoutRequest, PayoutStatus } from '@/features/payouts/types'

const PAGE_SIZE = 8

type StatusFilter = 'all' | PayoutStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'Pending', label: 'รอดำเนินการ' },
  { value: 'Approved', label: 'อนุมัติแล้ว' },
  { value: 'Paid', label: 'จ่ายแล้ว' },
  { value: 'Rejected', label: 'ปฏิเสธ' },
]

const STATUS_META: Record<PayoutStatus, { variant: BadgeVariant; label: string }> = {
  Pending: { variant: 'pending', label: 'รอดำเนินการ' },
  Approved: { variant: 'info', label: 'อนุมัติแล้ว' },
  Paid: { variant: 'verified', label: 'จ่ายแล้ว' },
  Rejected: { variant: 'rejected', label: 'ปฏิเสธ' },
}

const columns: Column<PayoutRequest>[] = [
  {
    key: 'id',
    header: 'Request ID',
    cell: (p) => (
      <span className="rounded bg-surface px-2 py-1 font-mono text-[13px] text-ink-secondary">
        {p.id}
      </span>
    ),
  },
  {
    key: 'farmer',
    header: 'เกษตรกร',
    cell: (p) => (
      <Link
        href={`/admin/farmers/${p.farmerId}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-ink hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
      >
        {p.farmerName}
      </Link>
    ),
  },
  {
    key: 'carbon',
    header: 'Carbon (kgCO₂e)',
    align: 'right',
    cell: (p) => (
      <span className="font-mono tabular-nums text-ink-secondary">
        {formatNumber(p.totalCarbonKgCo2e)}
      </span>
    ),
  },
  {
    key: 'value',
    header: 'มูลค่าโดยประมาณ',
    align: 'right',
    cell: (p) => (
      <span className="font-mono tabular-nums font-semibold text-ink">
        ฿{formatNumber(p.estimatedValueThb)}
      </span>
    ),
  },
  {
    key: 'bank',
    header: 'ธนาคาร',
    cell: (p) => <span className="text-[13px] text-ink-secondary">{p.bankName}</span>,
  },
  {
    key: 'account',
    header: 'เลขบัญชี',
    cell: (p) => (
      <span className="font-mono text-[13px] tracking-wider text-ink-secondary">
        {maskAccountNumber(p.accountNumber)}
      </span>
    ),
  },
  {
    key: 'requested',
    header: 'วันที่ขอ',
    cell: (p) => (
      <span className="text-[13px] text-ink-secondary">{formatDate(p.requestedAt)}</span>
    ),
  },
  {
    key: 'status',
    header: 'สถานะ',
    cell: (p) => {
      const m = STATUS_META[p.status]
      return (
        <Badge variant={m.variant} dot>
          {m.label}
        </Badge>
      )
    },
  },
]

export function PayoutTable({ payouts }: { payouts: PayoutRequest[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return payouts.filter((p) => {
      const matchesStatus = status === 'all' || p.status === status
      const matchesQuery =
        q === '' ||
        p.farmerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [payouts, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="ค้นหาชื่อเกษตรกร หรือ Request ID"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-line bg-panel p-1">
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

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(p) => p.id}
        onRowClick={(p) => router.push(`/admin/payouts/${p.id}`)}
        empty={{
          icon: <Wallet className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบรายการถอนเงิน',
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
