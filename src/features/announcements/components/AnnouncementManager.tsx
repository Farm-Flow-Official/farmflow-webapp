'use client'

import { useId, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Megaphone, ImagePlus, Loader2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { TargetPicker } from '@/features/announcements/components/TargetPicker'
import { uploadAnnouncementBanner } from '@/features/announcements/actions/bannerActions'
import { publicFileUrl } from '@/lib/farm-cover'
import {
  BANNER_LIMITS_TEXT,
  BANNER_MAX_BYTES,
  BANNER_MAX_MB,
  BANNER_MIME_TYPES,
  type AnnouncementTarget,
} from '@/features/announcements/types/targets'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils/format'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementStatus,
} from '@/features/announcements/types'
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/features/announcements/actions/announcementActions'

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

  async function handleSave(input: AnnouncementInput) {
    if (editing === 'new') {
      const res = await createAnnouncement(input)
      if (!res.ok) return showToast(res.error)
      setItems((prev) => [res.data, ...prev])
      showToast('สร้างประกาศเรียบร้อย')
    } else if (editing) {
      const res = await updateAnnouncement(editing.id, input)
      if (!res.ok) return showToast(res.error)
      const updated = res.data
      setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      showToast('แก้ไขประกาศเรียบร้อย')
    }
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    const id = deleting.id
    const res = await deleteAnnouncement(id)
    if (!res.ok) return showToast(res.error ?? 'ลบประกาศไม่สำเร็จ')
    setItems((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
    showToast('ลบประกาศเรียบร้อย')
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

/** ISO → the `YYYY-MM-DDTHH:mm` a `datetime-local` input expects, in local time. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
  const [targets, setTargets] = useState<AnnouncementTarget[]>(initial?.targets ?? [])
  // `datetime-local` wants `YYYY-MM-DDTHH:mm`; the API speaks ISO.
  const [startAt, setStartAt] = useState(toLocalInput(initial?.startAt))
  const [endAt, setEndAt] = useState(toLocalInput(initial?.endAt))
  const [touched, setTouched] = useState(false)
  const [bannerFileId, setBannerFileId] = useState<string | null>(initial?.bannerFileId ?? null)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const titleError = touched && title.trim() === ''
  const windowError =
    startAt !== '' && endAt !== '' && new Date(startAt) >= new Date(endAt)
      ? 'วันที่เริ่มแสดงต้องมาก่อนวันที่สิ้นสุด'
      : null
  // Publishing with no destination is the one combination that silently does
  // nothing, so it is blocked rather than warned about.
  const targetError =
    status === 'Active' && targets.length === 0
      ? 'ประกาศที่เผยแพร่ต้องเลือกอย่างน้อย 1 ปลายทาง'
      : null

  const bannerUrl = publicFileUrl(bannerFileId)

  async function pickBanner(file: File | undefined) {
    if (!file) return
    setBannerError(null)

    // Checked here as well as on the server, because the round trip is the
    // slow part and "that file is 12 MB" is worth saying before spending it.
    if (!BANNER_MIME_TYPES.includes(file.type)) {
      return setBannerError(`ไฟล์นี้ไม่ใช่รูปที่รองรับ — รับเฉพาะ ${BANNER_LIMITS_TEXT}`)
    }
    if (file.size > BANNER_MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1)
      return setBannerError(`รูปใหญ่เกินไป (${mb} MB) — รับไม่เกิน ${BANNER_MAX_MB} MB`)
    }

    setUploading(true)

    const form = new FormData()
    form.append('file', file)
    const res = await uploadAnnouncementBanner(form)

    setUploading(false)
    if (!res.ok) return setBannerError(res.error)
    // Stored immediately, attached when the announcement is saved — an image
    // uploaded for a notice that is then cancelled is an orphan, not a leak.
    setBannerFileId(res.fileId)
  }

  function submit() {
    setTouched(true)
    if (title.trim() === '' || windowError || targetError) return
    onSave({
      title: title.trim(),
      body: body.trim(),
      status,
      targets,
      bannerFileId,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      endAt: endAt ? new Date(endAt).toISOString() : null,
    })
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
          <label className="mb-1.5 block text-sm font-medium text-ink">
            รูปแบนเนอร์ <span className="font-normal text-ink-muted">(ไม่บังคับ)</span>
          </label>

          {bannerUrl ? (
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt="ตัวอย่างแบนเนอร์"
                className="h-20 w-32 shrink-0 rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => setBannerFileId(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                เอารูปออก
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-center transition-colors hover:border-primary hover:bg-primary/5">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
              ) : (
                <ImagePlus className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
              )}
              <span className="text-[13px] text-ink-secondary">
                {uploading ? 'กำลังอัปโหลด…' : `เลือกรูป (${BANNER_LIMITS_TEXT})`}
              </span>
              <span className="text-[11px] text-ink-muted">
                แสดงเฉพาะปลายทางที่เลือกเป็น &ldquo;แบนเนอร์&rdquo;
              </span>
              <input
                type="file"
                accept={BANNER_MIME_TYPES.join(',')}
                disabled={uploading}
                onChange={(e) => void pickBanner(e.target.files?.[0])}
                className="sr-only"
              />
            </label>
          )}

          {bannerError && <p className="mt-1 text-xs text-error">{bannerError}</p>}
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

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">แสดงที่ไหน</p>
          <TargetPicker value={targets} onChange={setTargets} />
          {touched && targetError && <p className="mt-1 text-xs text-error">{targetError}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ann-start" className="mb-1.5 block text-sm font-medium text-ink">
              เริ่มแสดง
            </label>
            <input
              id="ann-start"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <p className="mt-1 text-[11px] text-ink-muted">เว้นว่าง = แสดงทันทีที่เผยแพร่</p>
          </div>
          <div>
            <label htmlFor="ann-end" className="mb-1.5 block text-sm font-medium text-ink">
              สิ้นสุด
            </label>
            <input
              id="ann-end"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <p className="mt-1 text-[11px] text-ink-muted">เว้นว่าง = แสดงจนกว่าจะปิดเอง</p>
          </div>
          {windowError && <p className="text-xs text-error sm:col-span-2">{windowError}</p>}
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
