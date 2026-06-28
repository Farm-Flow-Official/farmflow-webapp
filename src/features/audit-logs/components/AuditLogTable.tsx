'use client'

import { useMemo, useState, useId } from 'react'
import { Search, Eye, ScrollText, ArrowRight } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { FilterPills } from '@/components/ui/filter-pills'
import { Pagination } from '@/components/ui/pagination'
import { Modal } from '@/components/ui/modal'
import { formatDateTime } from '@/lib/utils/format'
import {
  AUDIT_ACTIONS,
  type AuditLog,
  type AuditAction,
  type AuditActorType,
} from '@/features/audit-logs/types'

const PAGE_SIZE = 10

const ACTION_VARIANT: Record<AuditAction, BadgeVariant> = {
  CREATE: 'info',
  UPDATE: 'pending',
  DELETE: 'rejected',
  APPROVE: 'verified',
  REJECT: 'rejected',
}

const ACTOR_CHIP: Record<AuditActorType, string> = {
  ADMIN: 'bg-info-bg text-info',
  USER: 'bg-primary-subtle text-primary',
  SYSTEM: 'bg-sunken text-ink-secondary',
}

const ACTION_FILTERS: { value: 'all' | AuditAction; label: string }[] = [
  { value: 'all', label: 'ทุกการกระทำ' },
  ...AUDIT_ACTIONS.map((a) => ({ value: a, label: a })),
]

const RANGE_FILTERS: { value: 'all' | '1' | '7' | '30'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: '1', label: '24 ชม.' },
  { value: '7', label: '7 วัน' },
  { value: '30', label: '30 วัน' },
]

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [query, setQuery] = useState('')
  const [action, setAction] = useState<'all' | AuditAction>('all')
  const [range, setRange] = useState<'all' | '1' | '7' | '30'>('all')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<AuditLog | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const cutoff =
      range === 'all' ? 0 : Date.now() - Number(range) * 86_400_000
    return logs.filter((l) => {
      const matchesQuery =
        q === '' ||
        (l.actorId?.toLowerCase().includes(q) ?? false) ||
        l.actorType.toLowerCase().includes(q) ||
        (l.actorLabel?.toLowerCase().includes(q) ?? false) ||
        l.recordId.toLowerCase().includes(q) ||
        l.tableName.toLowerCase().includes(q)
      const matchesAction = action === 'all' || l.action === action
      const matchesRange = range === 'all' || new Date(l.createdAt).getTime() >= cutoff
      return matchesQuery && matchesAction && matchesRange
    })
  }, [logs, query, action, range])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setPage(1)
    }
  }

  const columns: Column<AuditLog>[] = [
    {
      key: 'time',
      header: 'เวลา',
      cell: (l) => (
        <span className="whitespace-nowrap text-[13px] text-ink-secondary">
          {formatDateTime(l.createdAt)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'ผู้ทำรายการ',
      cell: (l) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-bold tracking-wide ${ACTOR_CHIP[l.actorType]}`}
          >
            {l.actorType}
          </span>
          {l.actorType !== 'SYSTEM' &&
            (l.actorLabel ? (
              <span className="flex flex-col leading-tight">
                <span className="text-[13px] font-medium text-ink">{l.actorLabel}</span>
                <span className="font-mono text-[10px] text-ink-muted">{l.actorId}</span>
              </span>
            ) : (
              <span className="font-mono text-[13px] text-ink-secondary">{l.actorId}</span>
            ))}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'การกระทำ',
      cell: (l) => <Badge variant={ACTION_VARIANT[l.action]}>{l.action}</Badge>,
    },
    {
      key: 'target',
      header: 'เป้าหมาย',
      cell: (l) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-ink">{l.tableName}</span>
          <span className="font-mono text-xs text-ink-muted">{l.recordId}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (l) => (
        <button
          type="button"
          aria-label="ดูการเปลี่ยนแปลง"
          title="ดูการเปลี่ยนแปลง"
          onClick={() => setViewing(l)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Eye className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
            placeholder="ค้นหา actor / record / ตาราง / ประเภท"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <FilterPills
          ariaLabel="ช่วงเวลา"
          options={RANGE_FILTERS}
          value={range}
          onChange={resetPage(setRange)}
        />
        <FilterPills
          ariaLabel="การกระทำ"
          options={ACTION_FILTERS}
          value={action}
          onChange={resetPage(setAction)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(l) => l.id}
        empty={{
          icon: <ScrollText className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ไม่พบบันทึกกิจกรรม',
          description: 'ลองปรับคำค้นหาหรือตัวกรอง',
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />

      {viewing && <ChangeViewer log={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

/* ── Change viewer (before → after) ─────────────────────────────────────── */

function fmtValue(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

function ChangeViewer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const titleId = useId()
  const keys = Array.from(
    new Set([
      ...Object.keys(log.oldData ?? {}),
      ...Object.keys(log.newData ?? {}),
    ]),
  )

  const mode: 'created' | 'deleted' | 'changed' = !log.oldData
    ? 'created'
    : !log.newData
      ? 'deleted'
      : 'changed'

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          การเปลี่ยนแปลง
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          <span className="font-semibold text-ink-secondary">{log.action}</span> ·{' '}
          {log.tableName} ·{' '}
          <span className="font-mono">{log.recordId}</span> ·{' '}
          {formatDateTime(log.createdAt)}
        </p>
      </div>

      <div className="overflow-y-auto px-6 py-5">
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {keys.map((key, i) => {
            const oldV = log.oldData?.[key]
            const newV = log.newData?.[key]
            const changed =
              mode === 'changed' && JSON.stringify(oldV) !== JSON.stringify(newV)
            const rowBg = i % 2 === 0 ? 'bg-panel' : 'bg-surface'
            return (
              <Field
                key={key}
                fieldKey={key}
                oldV={oldV}
                newV={newV}
                mode={mode}
                changed={changed}
                rowBg={rowBg}
              />
            )
          })}
        </div>

        {mode === 'deleted' && (
          <p className="mt-3 text-xs text-error">เรกคอร์ดนี้ถูกลบออกจากระบบ</p>
        )}
        {mode === 'created' && (
          <p className="mt-3 text-xs text-success">เรกคอร์ดนี้ถูกสร้างใหม่</p>
        )}
      </div>

      <div className="flex justify-end border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ปิด
        </button>
      </div>
    </Modal>
  )
}

function Field({
  fieldKey,
  oldV,
  newV,
  mode,
  changed,
  rowBg,
}: {
  fieldKey: string
  oldV: string | number | boolean | null | undefined
  newV: string | number | boolean | null | undefined
  mode: 'created' | 'deleted' | 'changed'
  changed: boolean
  rowBg: string
}) {
  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 ${rowBg}`}>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {fieldKey}
        </p>
        <p
          className={`break-words font-mono text-[13px] ${
            mode === 'created'
              ? 'text-ink-disabled'
              : changed
                ? 'text-error line-through'
                : 'text-ink-secondary'
          }`}
        >
          {mode === 'created' ? '—' : fmtValue(oldV)}
        </p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {fieldKey}
        </p>
        <p
          className={`break-words font-mono text-[13px] ${
            mode === 'deleted'
              ? 'text-ink-disabled'
              : changed
                ? 'font-semibold text-success'
                : 'text-ink-secondary'
          }`}
        >
          {mode === 'deleted' ? '—' : fmtValue(newV)}
        </p>
      </div>
    </div>
  )
}
