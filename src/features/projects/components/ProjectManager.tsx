'use client'

import { useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils/format'
import {
  PROJECT_STATUS_LABELS,
  IMPLEMENTATION_MODE_LABELS,
  type ProjectInput,
  type ProjectListItem,
  type ProjectStatus,
} from '@/features/projects/types'
import { createProject, deleteProject, updateProject } from '@/features/projects/actions/projectActions'

type VerifierOrg = { id: string; nameTh: string }

type Props = {
  initialItems: ProjectListItem[]
  verifierOrgs: VerifierOrg[]
  canWrite: boolean
  canDelete: boolean
}

/** Sentinel for "create new" vs editing an existing row. */
type Editing = ProjectListItem | 'new' | null

const STATUS_VARIANT: Record<ProjectStatus, 'verified' | 'neutral' | 'info' | 'pending'> = {
  draft: 'neutral',
  open: 'info',
  active: 'verified',
  closed: 'pending',
  archived: 'neutral',
}

export function ProjectManager({ initialItems, verifierOrgs, canWrite, canDelete }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<ProjectListItem[]>(initialItems)
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<ProjectListItem | null>(null)
  const { message, showToast } = useToast()

  const enrolledFarms = useMemo(
    () => items.reduce((sum, p) => sum + p.farmCount, 0),
    [items],
  )

  async function handleSave(input: ProjectInput) {
    if (editing === 'new') {
      const res = await createProject(input)
      if (!res.ok) return showToast(res.error)
      // The detail response is a superset of the list row, so it slots straight in.
      setItems((prev) => [{ ...res.data, farmCount: 0, verifierOrgName: null }, ...prev])
      showToast('สร้างโครงการเรียบร้อย')
    } else if (editing) {
      const res = await updateProject(editing.id, input)
      if (!res.ok) return showToast(res.error)
      const updated = res.data
      setItems((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated, farmCount: p.farmCount } : p)),
      )
      showToast('แก้ไขโครงการเรียบร้อย')
    }
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    const id = deleting.id
    const res = await deleteProject(id)
    // A project with farms still enrolled is refused; the API message says how many.
    if (!res.ok) {
      setDeleting(null)
      return showToast(res.error ?? 'ลบโครงการไม่สำเร็จ')
    }
    setItems((prev) => prev.filter((p) => p.id !== id))
    setDeleting(null)
    showToast('ลบโครงการเรียบร้อย')
  }

  const columns: Column<ProjectListItem>[] = [
    {
      key: 'name',
      header: 'โครงการ',
      cell: (p) => (
        <div className="flex max-w-md flex-col">
          <span className="truncate font-medium text-ink">{p.nameTh}</span>
          <span className="truncate text-xs text-ink-muted">
            {p.projectCode}
            {p.nameEn ? ` · ${p.nameEn}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (p) => (
        <Badge variant={STATUS_VARIANT[p.status]} dot>
          {PROJECT_STATUS_LABELS[p.status]}
        </Badge>
      ),
    },
    {
      key: 'farms',
      header: 'ฟาร์ม',
      align: 'right',
      cell: (p) => <span className="text-[13px] font-medium text-ink">{p.farmCount}</span>,
    },
    {
      key: 'crediting',
      header: 'ระยะเวลาคิดเครดิต',
      cell: (p) => (
        <span className="text-[13px] text-ink-secondary">
          {p.creditingPeriodYears ? `${p.creditingPeriodYears} ปี` : '—'}
        </span>
      ),
    },
    {
      key: 'verifier',
      header: 'หน่วยตรวจสอบ',
      cell: (p) => (
        <span className="text-[13px] text-ink-secondary">
          {p.verifierOrgName ?? 'ยังไม่มอบหมาย'}
        </span>
      ),
    },
    {
      key: 'updated',
      header: 'อัปเดตล่าสุด',
      cell: (p) => (
        <span className="text-[13px] text-ink-secondary">{formatDate(p.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          {canWrite && (
            <RowAction label="แก้ไข" onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </RowAction>
          )}
          {canDelete && (
            <RowAction label="ลบ" tone="danger" onClick={() => setDeleting(p)}>
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
          ทั้งหมด <span className="font-medium text-ink">{items.length}</span> โครงการ ·{' '}
          ฟาร์มที่เข้าร่วม <span className="font-medium text-ink">{enrolledFarms}</span>
        </p>
        {canWrite && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            สร้างโครงการใหม่
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(p) => p.id}
        onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
        empty={{
          icon: <FolderTree className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: 'ยังไม่มีโครงการ',
          description: 'กดปุ่ม “สร้างโครงการใหม่” เพื่อเริ่มเปิดโครงการคาร์บอนเครดิต',
        }}
      />

      {editing !== null && (
        <ProjectForm
          initial={editing === 'new' ? null : editing}
          verifierOrgs={verifierOrgs}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="ยืนยันการลบโครงการ"
          description={
            <>
              ลบโครงการ “{deleting.nameTh}”?
              {deleting.farmCount > 0 && (
                <>
                  {' '}
                  โครงการนี้ยังมีฟาร์ม {deleting.farmCount} แห่งอยู่ — ต้องถอนฟาร์มออกก่อนจึงจะลบได้
                </>
              )}
            </>
          }
          confirmLabel="ลบโครงการ"
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
      // Stop click AND keydown from bubbling to the clickable DataTable row,
      // otherwise Enter/Space here would also navigate to the detail page.
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

const FIELD_BASE =
  'h-10 w-full rounded-lg border bg-panel px-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:outline-none focus:ring-2'
const FIELD_OK = 'border-line focus:border-primary focus:ring-primary/15'
const FIELD_ERR = 'border-error-border focus:border-error focus:ring-error/15'

function ProjectForm({
  initial,
  verifierOrgs,
  onSave,
  onClose,
}: {
  initial: ProjectListItem | null
  verifierOrgs: VerifierOrg[]
  onSave: (input: ProjectInput) => void
  onClose: () => void
}) {
  const titleId = useId()
  const [projectCode, setProjectCode] = useState(initial?.projectCode ?? '')
  const [nameTh, setNameTh] = useState(initial?.nameTh ?? '')
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? '')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'draft')
  const [mode, setMode] = useState(initial?.implementationMode ?? 'standalone')
  const [period, setPeriod] = useState(initial?.creditingPeriodYears?.toString() ?? '')
  const [startDate, setStartDate] = useState(initial?.creditingStartDate ?? '')
  const [orgId, setOrgId] = useState(initial?.verifierOrgId ?? '')
  const [touched, setTouched] = useState(false)

  const codeError = touched && projectCode.trim() === ''
  const nameError = touched && nameTh.trim() === ''

  function submit() {
    setTouched(true)
    if (projectCode.trim() === '' || nameTh.trim() === '') return

    onSave({
      projectCode: projectCode.trim(),
      nameTh: nameTh.trim(),
      // Omit rather than send empty strings — the API treats absent as "unchanged".
      ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
      status,
      implementationMode: mode,
      ...(period ? { creditingPeriodYears: Number(period) } : {}),
      ...(startDate ? { creditingStartDate: startDate } : {}),
      verifierOrgId: orgId || null,
    })
  }

  return (
    // Backdrop click won't discard typed input; Esc still closes.
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          {initial ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          รายละเอียดเต็มตามฟอร์ม อบก. จะกรอกใน PDD Wizard ภายหลัง
        </p>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <label htmlFor="prj-code" className="mb-1.5 block text-sm font-medium text-ink">
            รหัสโครงการ <span className="text-error">*</span>
          </label>
          <input
            id="prj-code"
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="เช่น TVER-NAN-2569"
            aria-invalid={codeError}
            className={`${FIELD_BASE} ${codeError ? FIELD_ERR : FIELD_OK}`}
          />
          {codeError && <p className="mt-1 text-xs text-error">กรุณากรอกรหัสโครงการ</p>}
        </div>

        <div>
          <label htmlFor="prj-name-th" className="mb-1.5 block text-sm font-medium text-ink">
            ชื่อโครงการ (ไทย) <span className="text-error">*</span>
          </label>
          <input
            id="prj-name-th"
            type="text"
            value={nameTh}
            onChange={(e) => setNameTh(e.target.value)}
            placeholder="เช่น โครงการปลูกป่าชุมชนจังหวัดน่าน"
            aria-invalid={nameError}
            className={`${FIELD_BASE} ${nameError ? FIELD_ERR : FIELD_OK}`}
          />
          {nameError && <p className="mt-1 text-xs text-error">กรุณากรอกชื่อโครงการ</p>}
        </div>

        <div>
          <label htmlFor="prj-name-en" className="mb-1.5 block text-sm font-medium text-ink">
            ชื่อโครงการ (อังกฤษ)
          </label>
          <input
            id="prj-name-en"
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={`${FIELD_BASE} ${FIELD_OK}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="prj-status" className="mb-1.5 block text-sm font-medium text-ink">
              สถานะ
            </label>
            <select
              id="prj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={`${FIELD_BASE} ${FIELD_OK}`}
            >
              {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {status === 'open' && (
              <p className="mt-1 text-xs text-ink-muted">เกษตรกรจะเห็นโครงการนี้ในแอปมือถือ</p>
            )}
          </div>

          <div>
            <label htmlFor="prj-mode" className="mb-1.5 block text-sm font-medium text-ink">
              รูปแบบการดำเนินโครงการ
            </label>
            <select
              id="prj-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              className={`${FIELD_BASE} ${FIELD_OK}`}
            >
              {Object.entries(IMPLEMENTATION_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="prj-period" className="mb-1.5 block text-sm font-medium text-ink">
              ระยะเวลาคิดเครดิต
            </label>
            <select
              id="prj-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`${FIELD_BASE} ${FIELD_OK}`}
            >
              <option value="">ยังไม่ระบุ</option>
              <option value="7">7 ปี</option>
              <option value="10">10 ปี</option>
            </select>
          </div>

          <div>
            <label htmlFor="prj-start" className="mb-1.5 block text-sm font-medium text-ink">
              วันเริ่มคิดเครดิต
            </label>
            <input
              id="prj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${FIELD_BASE} ${FIELD_OK}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prj-org" className="mb-1.5 block text-sm font-medium text-ink">
            หน่วยตรวจสอบที่มอบหมาย
          </label>
          <select
            id="prj-org"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className={`${FIELD_BASE} ${FIELD_OK}`}
          >
            <option value="">ยังไม่มอบหมาย (ผู้ตรวจสอบทุกหน่วยเห็น)</option>
            {verifierOrgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nameTh}
              </option>
            ))}
          </select>
        </div>
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
          {initial ? 'บันทึกการแก้ไข' : 'สร้างโครงการ'}
        </button>
      </div>
    </Modal>
  )
}
