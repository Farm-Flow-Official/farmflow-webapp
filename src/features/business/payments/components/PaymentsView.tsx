'use client'

import { useMemo, useState } from 'react'
import { Search, Receipt, AlertTriangle, Copy } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { FilterPills } from '@/components/ui/filter-pills'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDateTime, formatNumber, formatPhone } from '@/lib/utils/format'
import type {
  PaymentSlip,
  PaymentSlipStatus,
} from '@/features/business/payments/types'
import { hasAmountMismatch, slipStatusBadge } from '@/features/business/payments/lib'
import { SlipReviewModal } from '@/features/business/payments/components/SlipReviewModal'

const PAGE_SIZE = 8

type StatusFilter = 'all' | PaymentSlipStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'Pending_Review', label: 'รอตรวจสอบ' },
  { value: 'Approved', label: 'อนุมัติแล้ว' },
  { value: 'Rejected', label: 'ปฏิเสธ' },
  { value: 'all', label: 'ทั้งหมด' },
]

export function PaymentsView({
  slips,
  reviewerName,
}: {
  slips: PaymentSlip[]
  reviewerName: string
}) {
  const [rows, setRows] = useState(slips)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('Pending_Review')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<PaymentSlip | null>(null)
  const { message, showToast } = useToast()

  const pendingCount = useMemo(
    () => rows.filter((s) => s.status === 'Pending_Review').length,
    [rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = q.replace(/\D/g, '')
    return rows.filter((s) => {
      const matchesStatus = status === 'all' || s.status === status
      const matchesQuery =
        q === '' ||
        s.customerName.toLowerCase().includes(q) ||
        (qDigits !== '' && s.phone.replace(/\D/g, '').includes(qDigits))
      return matchesStatus && matchesQuery
    })
  }, [rows, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const columns: Column<PaymentSlip>[] = [
    {
      key: 'customer',
      header: 'ลูกค้า',
      cell: (s) => (
        <div className="flex flex-col">
          <span className="font-medium text-ink">{s.customerName}</span>
          <span className="font-mono text-xs text-ink-muted">{formatPhone(s.phone)}</span>
        </div>
      ),
    },
    {
      key: 'package',
      header: 'แพ็กเกจ',
      cell: (s) => (
        <span className="inline-flex h-6 items-center rounded bg-primary-subtle px-2.5 text-xs font-semibold text-primary">
          {s.packageName}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'ยอดบนสลิป',
      align: 'right',
      cell: (s) => {
        const mismatch = hasAmountMismatch(s)
        return (
          <div className="flex flex-col items-end">
            <span className={`font-mono tabular-nums ${mismatch ? 'text-error' : 'text-ink'}`}>
              ฿{formatNumber(s.declaredAmountThb)}
            </span>
            {mismatch && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-error">
                <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                ยอดไม่ตรง
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'uploaded',
      header: 'อัปโหลด',
      cell: (s) => (
        <span className="text-[13px] text-ink-secondary">{formatDateTime(s.createdAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (s) => {
        const b = slipStatusBadge(s.status)
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant={b.variant} dot>
              {b.label}
            </Badge>
            {s.duplicateFlag && (
              <span title="อาจเป็นสลิปซ้ำ" className="text-warning">
                <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                <span className="sr-only">อาจเป็นสลิปซ้ำ</span>
              </span>
            )}
          </div>
        )
      },
    },
  ]

  function onResolve(updated: PaymentSlip, msg: string) {
    // Seam: replace with POST approve/reject + refetch.
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setSelected(null)
    showToast(msg)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pending summary */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-bg text-warning">
          <Receipt className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{pendingCount} รายการรอตรวจสอบ</p>
          <p className="text-xs text-ink-muted">ตรวจสลิป → อนุมัติเปิดใช้งานสมาชิก หรือปฏิเสธ</p>
        </div>
      </div>

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
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="ค้นหาชื่อหรือเบอร์โทร"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <FilterPills
          ariaLabel="กรองตามสถานะ"
          options={STATUS_FILTERS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
      </div>

      {/* Queue */}
      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(s) => s.id}
        onRowClick={(s) => setSelected(s)}
        empty={{
          icon: <Receipt className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่มีสลิปในสถานะนี้',
          description: 'ลองปรับตัวกรองหรือคำค้นหา',
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />

      {selected && (
        <SlipReviewModal
          slip={selected}
          reviewerName={reviewerName}
          onClose={() => setSelected(null)}
          onResolve={onResolve}
        />
      )}

      <Toast message={message} />
    </div>
  )
}
