'use client'

import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { FilterPills } from '@/components/ui/filter-pills'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate, formatPhone } from '@/lib/utils/format'
import type {
  CustomerSubscription,
  Package,
  PackageCode,
  SubscriptionStatus,
} from '@/features/business/packages/types'
import {
  effectiveCap,
  isExpiringSoon,
  isOverQuota,
  statusBadge,
} from '@/features/business/packages/lib'
import { SubscriptionDetailModal } from '@/features/business/packages/components/SubscriptionDetailModal'

const PAGE_SIZE = 8

type TierFilter = 'all' | PackageCode
type StatusFilter = 'all' | SubscriptionStatus

const TIER_FILTERS: { value: TierFilter; label: string }[] = [
  { value: 'all', label: 'ทุกแพ็กเกจ' },
  { value: 'FREE', label: 'Free' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
]

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'Active', label: 'ใช้งาน' },
  { value: 'Pending_Payment', label: 'รอชำระ' },
  { value: 'Suspended', label: 'ระงับ' },
  { value: 'Expired', label: 'หมดอายุ' },
]

function QuotaCell({ sub }: { sub: CustomerSubscription }) {
  const cap = effectiveCap(sub)
  const over = isOverQuota(sub)
  const pct = cap == null ? 0 : Math.min(100, Math.round((sub.usedRai / cap) * 100))
  return (
    <div className="min-w-[120px]">
      <p className={`font-mono text-[13px] tabular-nums ${over ? 'text-error' : 'text-ink'}`}>
        {sub.usedRai} / {cap == null ? '∞' : cap} ไร่
      </p>
      {cap != null && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={`h-full rounded-full ${over ? 'bg-error' : pct >= 90 ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function SubscriptionTable({
  subscriptions,
  packages,
}: {
  subscriptions: CustomerSubscription[]
  packages: Package[]
}) {
  const [rows, setRows] = useState(subscriptions)
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<TierFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [expiringOnly, setExpiringOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<CustomerSubscription | null>(null)
  const { message, showToast } = useToast()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = q.replace(/\D/g, '')
    return rows.filter((s) => {
      const matchesQuery =
        q === '' ||
        s.customerName.toLowerCase().includes(q) ||
        // Only match on phone when the query actually has digits — otherwise
        // `''.includes('')` is true and every row leaks through.
        (qDigits !== '' && s.phone.replace(/\D/g, '').includes(qDigits))
      const matchesTier = tier === 'all' || s.packageCode === tier
      const matchesStatus = status === 'all' || s.status === status
      const matchesExpiring = !expiringOnly || isExpiringSoon(s)
      return matchesQuery && matchesTier && matchesStatus && matchesExpiring
    })
  }, [rows, query, tier, status, expiringOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetPage = () => setPage(1)

  const columns: Column<CustomerSubscription>[] = [
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
      key: 'tier',
      header: 'แพ็กเกจ',
      cell: (s) => (
        <span className="inline-flex h-6 items-center rounded bg-primary-subtle px-2.5 text-xs font-semibold text-primary">
          {s.packageName}
        </span>
      ),
    },
    {
      key: 'quota',
      header: 'พื้นที่ใช้งาน',
      cell: (s) => <QuotaCell sub={s} />,
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (s) => {
        const b = statusBadge(s.status)
        return (
          <Badge variant={b.variant} dot>
            {b.label}
          </Badge>
        )
      },
    },
    {
      key: 'expiry',
      header: 'หมดอายุ',
      cell: (s) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-ink-secondary">
            {s.expiryDate ? formatDate(s.expiryDate) : '—'}
          </span>
          {isExpiringSoon(s) && (
            <span className="text-[11px] font-semibold text-warning">ใกล้หมดอายุ</span>
          )}
        </div>
      ),
    },
  ]

  function onApply(updated: CustomerSubscription, msg: string) {
    // Seam: replace with `PATCH /api/business/subscriptions/:id` + refetch.
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setSelected(null)
    showToast(msg)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3">
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
                resetPage()
              }}
              placeholder="ค้นหาชื่อหรือเบอร์โทร"
              className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => {
                setExpiringOnly(e.target.checked)
                resetPage()
              }}
              className="h-4 w-4 rounded border-line text-primary focus:ring-2 focus:ring-primary/30"
            />
            ใกล้หมดอายุ (30 วัน)
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPills
            ariaLabel="กรองตามแพ็กเกจ"
            options={TIER_FILTERS}
            value={tier}
            onChange={(v) => {
              setTier(v)
              resetPage()
            }}
          />
          <FilterPills
            ariaLabel="กรองตามสถานะ"
            options={STATUS_FILTERS}
            value={status}
            onChange={(v) => {
              setStatus(v)
              resetPage()
            }}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(s) => s.id}
        onRowClick={(s) => setSelected(s)}
        empty={{
          icon: <Users className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบรายการสมาชิก',
          description: 'ลองปรับคำค้นหาหรือตัวกรอง',
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />

      {selected && (
        <SubscriptionDetailModal
          sub={selected}
          packages={packages}
          onClose={() => setSelected(null)}
          onApply={onApply}
        />
      )}

      <Toast message={message} />
    </div>
  )
}
