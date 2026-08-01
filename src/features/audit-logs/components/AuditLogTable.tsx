'use client'

import { useState, useId } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, ScrollText, ArrowRight } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { AUDIT_PAGE_SIZE as PAGE_SIZE } from '@/features/audit-logs/types/page-size'
import { Pagination } from '@/components/ui/pagination'
import { Modal } from '@/components/ui/modal'
import { formatDateTime } from '@/lib/utils/format'
import { useListQuery } from '@/lib/hooks/useListQuery'
import type { AuditFilterOptions, AuditLogPage } from '@/features/audit-logs/types/page'
import {
  AUDIT_ACTIONS,
  type AuditLog,
  type AuditAction,
  type AuditActorType,
} from '@/features/audit-logs/types'



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

const ACTION_FILTERS = [
  { value: 'all', label: 'ทุกการกระทำ' },
  ...AUDIT_ACTIONS.map((a) => ({ value: a as string, label: a })),
]

const SORTS = [
  { value: 'createdAt', label: 'เวลา' },
  { value: 'action', label: 'การกระทำ' },
  { value: 'tableName', label: 'ตาราง' },
]

/** `days` ago as YYYY-MM-DD, for the relative range shortcuts. */
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/**
 * The audit log, filtered on the server (ADMIN-AUDIT-01).
 *
 * Every control writes to the URL, so a filtered view can be linked to in a
 * ticket — which is most of what this screen is used for. It also means the
 * table only ever holds one page of an append-only log that never shrinks.
 */
export function AuditLogTable({
  page: logPage,
  filters,
}: {
  page: AuditLogPage
  filters: AuditFilterOptions
}) {
  const { q, sort, dir, page: pageNum, update, pending } = useListQuery({ sort: 'createdAt' })
  const params = useSearchParams()
  const [viewing, setViewing] = useState<AuditLog | null>(null)

  const action = params.get('action') ?? 'all'
  const actorId = params.get('actorId') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''

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
      <ListToolbar
        q={q}
        onQueryChange={(v) => update({ q: v })}
        placeholder="ค้นหา actor / record / ตาราง / การกระทำ"
        filters={ACTION_FILTERS}
        filterValue={action}
        onFilterChange={(v) => update({ action: v } as never)}
        filterLabel="การกระทำ"
        sorts={SORTS}
        sortValue={sort}
        dir={dir}
        onSortChange={(s, d) => update({ sort: s, dir: d })}
        pending={pending}
      />

      {/* Actor and date range: the two questions an investigation actually
          starts from — "what did this admin do", "what happened that week". */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-panel px-4 py-3">
        <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">
          ผู้ทำรายการ
          <select
            value={actorId}
            onChange={(e) => update({ actorId: e.target.value } as never)}
            className="h-9 min-w-[160px] rounded-lg border border-line bg-panel px-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="">ทุกคน</option>
            {filters.actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">
          ตั้งแต่
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => update({ from: e.target.value } as never)}
            className="h-9 rounded-lg border border-line bg-panel px-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <label className="flex flex-col gap-1 text-[12px] font-medium text-ink-muted">
          ถึง
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => update({ to: e.target.value } as never)}
            className="h-9 rounded-lg border border-line bg-panel px-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <div className="flex items-center gap-1.5">
          {[
            { days: 1, label: '24 ชม.' },
            { days: 7, label: '7 วัน' },
            { days: 30, label: '30 วัน' },
          ].map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => update({ from: daysAgo(r.days), to: '' } as never)}
              className="h-9 rounded-lg border border-line px-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {r.label}
            </button>
          ))}
          {(actorId || from || to) && (
            <button
              type="button"
              onClick={() => update({ actorId: '', from: '', to: '' } as never)}
              className="h-9 rounded-lg px-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      <div className={pending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <DataTable
          columns={columns}
          rows={logPage.rows}
          getRowKey={(l) => l.id}
          empty={{
            icon: <ScrollText className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
            title: 'ไม่พบบันทึกกิจกรรม',
            description: 'ลองปรับคำค้นหาหรือตัวกรอง',
          }}
        />
      </div>

      {logPage.total > PAGE_SIZE && (
        <Pagination
          page={pageNum}
          pageSize={PAGE_SIZE}
          total={logPage.total}
          onPageChange={(p) => update({ page: p })}
        />
      )}

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
