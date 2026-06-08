'use client'

import { useId, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils/format'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementStatus,
} from '@/features/announcements/types'

type Props = {
  initialItems: Announcement[]
  /** Result of `canDeleteAnnouncement(admin)` computed on the server. */
  canDelete: boolean
}

/** Sentinel for "create new" vs editing an existing row. */
type Editing = Announcement | 'new' | null

export function AnnouncementManager({ initialItems, canDelete }: Props) {
  const [items, setItems] = useState<Announcement[]>(initialItems)
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<Announcement | null>(null)
  const { message, showToast } = useToast()

  const activeCount = useMemo(
    () => items.filter((a) => a.status === 'Active').length,
    [items],
  )

  // MOCK ONLY — local state, no persistence. Replace with Server Actions / fetch.
  function handleSave(input: AnnouncementInput) {
    const now = new Date().toISOString()
    if (editing === 'new') {
      // Seam: await createAnnouncement(input)
      const created: Announcement = {
        id: `ANN-${Date.now()}`,
        ...input,
        createdAt: now,
        updatedAt: now,
      }
      setItems((prev) => [created, ...prev])
      showToast('สร้างประกาศเรียบร้อย (mock — ยังไม่บันทึกจริง)')
    } else if (editing) {
      // Seam: await updateAnnouncement(editing.id, input)
      const id = editing.id
      setItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...input, updatedAt: now } : a)),
      )
      showToast('แก้ไขประกาศเรียบร้อย (mock — ยังไม่บันทึกจริง)')
    }
    setEditing(null)
  }

  function handleDelete() {
    if (!deleting) return
    // Seam: await deleteAnnouncement(deleting.id)
    const id = deleting.id
    setItems((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
    showToast('ลบประกาศเรียบร้อย (mock — ยังไม่บันทึกจริง)')
  }

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: 'หัวข้อ',
      cell: (a) => (
        <div className="flex max-w-md flex-col">
          <span className="truncate font-medium text-ink">{a.title}</span>
          <span className="truncate text-xs text-ink-muted">{a.body}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (a) => (
        <Badge variant={a.status === 'Active' ? 'verified' : 'neutral'} dot>
          {a.status === 'Active' ? 'เผยแพร่' : 'ฉบับร่าง'}
        </Badge>
      ),
    },
    {
      key: 'updated',
      header: 'อัปเดตล่าสุด',
      cell: (a) => (
        <span className="text-[13px] text-ink-secondary">{formatDate(a.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (a) => (
        <div className="flex items-center justify-end gap-1">
          <RowAction label="แก้ไข" onClick={() => setEditing(a)}>
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </RowAction>
          {canDelete && (
            <RowAction label="ลบ" tone="danger" onClick={() => setDeleting(a)}>
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </RowAction>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-secondary">
          ทั้งหมด <span className="font-medium text-ink">{items.length}</span> ·{' '}
          เผยแพร่ <span className="font-medium text-success">{activeCount}</span> ·{' '}
          ฉบับร่าง{' '}
          <span className="font-medium text-ink">{items.length - activeCount}</span>
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          สร้างประกาศใหม่
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(a) => a.id}
        onRowClick={(a) => setEditing(a)}
        empty={{
          icon: <Megaphone className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ยังไม่มีประกาศ',
          description: 'กดปุ่ม “สร้างประกาศใหม่” เพื่อเริ่มต้น',
        }}
      />

      {editing !== null && (
        <AnnouncementForm
          initial={editing === 'new' ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="ยืนยันการลบประกาศ"
          description={<>ลบประกาศ “{deleting.title}”? การลบไม่สามารถย้อนกลับได้</>}
          confirmLabel="ลบประกาศ"
          tone="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}

      <Toast message={message} />
    </div>
  )
}

/* ── Row action button ──────────────────────────────────────────────────── */

function RowAction({
  label,
  tone = 'neutral',
  onClick,
  children,
}: {
  label: string
  tone?: 'neutral' | 'danger'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Stop both click AND keydown from bubbling to the clickable DataTable row,
      // otherwise Enter/Space here would also trigger the row's edit action.
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 ${
        tone === 'danger'
          ? 'hover:bg-error-bg hover:text-error focus-visible:ring-error'
          : 'hover:bg-surface hover:text-ink focus-visible:ring-primary'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Create / Edit form (modal) ─────────────────────────────────────────── */

function AnnouncementForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Announcement | null
  onSave: (input: AnnouncementInput) => void
  onClose: () => void
}) {
  const titleId = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [status, setStatus] = useState<AnnouncementStatus>(initial?.status ?? 'Draft')
  const [touched, setTouched] = useState(false)

  const titleError = touched && title.trim() === ''

  function submit() {
    setTouched(true)
    if (title.trim() === '') return
    onSave({ title: title.trim(), body: body.trim(), status })
  }

  return (
    // Forms keep typed input safe: backdrop click won't discard (Esc still works).
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          {initial ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
        </h2>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <label htmlFor="ann-title" className="mb-1.5 block text-sm font-medium text-ink">
            หัวข้อ <span className="text-error">*</span>
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น อัปเดตราคาคาร์บอนเครดิต"
            className={`h-10 w-full rounded-lg border bg-panel px-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:outline-none focus:ring-2 ${
              titleError
                ? 'border-error-border focus:border-error focus:ring-error/15'
                : 'border-line focus:border-primary focus:ring-primary/15'
            }`}
          />
          {titleError && <p className="mt-1 text-xs text-error">กรุณากรอกหัวข้อ</p>}
        </div>

        <div>
          <label htmlFor="ann-body" className="mb-1.5 block text-sm font-medium text-ink">
            เนื้อหา
          </label>
          <textarea
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="รายละเอียดประกาศ…"
            className="w-full resize-y rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {/* Publish toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">เผยแพร่ทันที</span>
            <span className="text-xs text-ink-muted">
              {status === 'Active'
                ? 'เกษตรกรจะเห็นประกาศนี้'
                : 'บันทึกเป็นฉบับร่าง ยังไม่เผยแพร่'}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={status === 'Active'}
            onClick={() => setStatus((s) => (s === 'Active' ? 'Draft' : 'Active'))}
            className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              status === 'Active' ? 'bg-primary' : 'bg-ink-disabled'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                status === 'Active' ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {initial ? 'บันทึกการแก้ไข' : 'สร้างประกาศ'}
        </button>
      </div>
    </Modal>
  )
}
