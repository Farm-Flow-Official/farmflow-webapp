'use client'

import { useId, useMemo, useState } from 'react'
import {
  UserPlus,
  Pencil,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Users,
  Search,
} from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Pagination } from '@/components/ui/pagination'
import { Toast, useToast } from '@/components/ui/toast'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import {
  ADMIN_ROLES,
  ROLE_INFO,
  type AdminUser,
  type AdminRole,
  type AdminStatus,
  type AdminInvite,
} from '@/features/admin-users/types'
import {
  inviteAdmin,
  updateAdminRole,
  setAdminStatus,
  deleteAdmin,
} from '@/features/admin-users/actions/adminActions'

type Props = {
  initialAdmins: AdminUser[]
}

const PAGE_SIZE = 8

/**
 * Per-role colour identity. The avatar tint and the role dot share the same hue
 * so a role is scannable from either — and none of them is green, keeping the
 * "Active" status (green) visually distinct. Light tints preserve the clean look.
 */
const ROLE_STYLE: Record<AdminRole, { dot: string; avatar: string }> = {
  MASTER: { dot: 'bg-info', avatar: 'bg-info-bg text-info' },
  VERIFIER: { dot: 'bg-pink-600', avatar: 'bg-pink-100 text-pink-700' },
  FINANCE: { dot: 'bg-ink', avatar: 'bg-ink text-white' },
  GENERAL: { dot: 'bg-ink-muted', avatar: 'bg-surface text-ink-secondary' },
}

const ROLE_FILTERS: { value: 'all' | AdminRole; label: string }[] = [
  { value: 'all', label: 'ทุกบทบาท' },
  ...ADMIN_ROLES.map((r) => ({ value: r, label: ROLE_INFO[r].label })),
]

const STATUS_FILTERS: { value: 'all' | AdminStatus; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'Active', label: 'ใช้งานอยู่' },
  { value: 'Inactive', label: 'ปิดใช้งาน' },
]

export function AdminUserManager({ initialAdmins }: Props) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins)
  const [inviting, setInviting] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const { message, showToast } = useToast()

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminStatus>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return admins.filter((a) => {
      const matchesQuery = q === '' || a.username.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || a.role === roleFilter
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [admins, query, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  async function handleInvite(invite: AdminInvite) {
    const res = await inviteAdmin(invite)
    if (!res.ok || !res.admin) {
      showToast(res.error ?? 'เชิญผู้ดูแลไม่สำเร็จ')
      return
    }
    const created = res.admin
    setAdmins((prev) => [created, ...prev])
    setInviting(false)
    // Clear filters so the newcomer is always visible.
    setQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setPage(1)
    showToast(`เชิญ ${invite.username} เข้าระบบแล้ว`)
  }

  async function handleEditRole(role: AdminRole) {
    if (!editing) return
    const id = editing.id
    const res = await updateAdminRole(id, role)
    if (!res.ok) {
      showToast(res.error ?? 'อัปเดตบทบาทไม่สำเร็จ')
      return
    }
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)))
    setEditing(null)
    showToast('อัปเดตบทบาทเรียบร้อย')
  }

  async function handleToggleStatus() {
    if (!statusTarget) return
    const id = statusTarget.id
    const next: AdminStatus = statusTarget.status === 'Active' ? 'Inactive' : 'Active'
    const res = await setAdminStatus(id, next)
    if (!res.ok) {
      showToast(res.error ?? 'อัปเดตสถานะไม่สำเร็จ')
      return
    }
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)))
    setStatusTarget(null)
    showToast(next === 'Inactive' ? 'ระงับบัญชีผู้ดูแลแล้ว' : 'เปิดใช้งานบัญชีผู้ดูแลแล้ว')
  }

  async function handleDelete() {
    if (!deleting) return
    const id = deleting.id
    const res = await deleteAdmin(id)
    if (!res.ok) {
      showToast(res.error ?? 'ลบบัญชีไม่สำเร็จ')
      return
    }
    setAdmins((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
    showToast('ลบบัญชีผู้ดูแลแล้ว')
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      header: 'ผู้ดูแล',
      cell: (a) => (
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${ROLE_STYLE[a.role].avatar}`}
          >
            {a.username.charAt(0).toUpperCase()}
          </span>
          <span className="font-mono text-[13px] font-medium text-ink">{a.username}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'บทบาท',
      cell: (a) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary">
          <span className={`h-1.5 w-1.5 rounded-full ${ROLE_STYLE[a.role].dot}`} aria-hidden />
          {ROLE_INFO[a.role].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (a) => (
        <Badge variant={a.status === 'Active' ? 'verified' : 'neutral'} dot>
          {a.status === 'Active' ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'เข้าระบบล่าสุด',
      cell: (a) => (
        <span className="text-[13px] text-ink-secondary" suppressHydrationWarning>
          {a.lastLoginAt ? (
            formatRelativeTime(a.lastLoginAt)
          ) : (
            <span className="text-ink-muted">ยังไม่เคยเข้าระบบ</span>
          )}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'สร้างเมื่อ',
      cell: (a) => (
        <span className="text-[13px] text-ink-secondary">{formatDate(a.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (a) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="แก้ไขบทบาท" onClick={() => setEditing(a)}>
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={a.status === 'Active' ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
            onClick={() => setStatusTarget(a)}
          >
            {a.status === 'Active' ? (
              <ShieldOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
            )}
          </IconButton>
          <IconButton label="ลบบัญชี" tone="danger" onClick={() => setDeleting(a)}>
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-secondary">
          ทั้งหมด <span className="font-medium text-ink">{admins.length}</span> บัญชี
          <span className="ml-1 text-ink-muted">(ไม่รวมบัญชีของคุณ)</span>
        </p>
        <button
          type="button"
          onClick={() => setInviting(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          เชิญผู้ดูแล
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
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
              placeholder="ค้นหา username"
              className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <FilterPills
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          />
        </div>

        <FilterPills
          options={ROLE_FILTERS}
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowKey={(a) => a.id}
        empty={{
          icon: <Users className="mb-2 h-8 w-8 text-ink-disabled" strokeWidth={1.5} />,
          title: admins.length === 0 ? 'ยังไม่มีผู้ดูแลคนอื่น' : 'ไม่พบผลลัพธ์',
          description:
            admins.length === 0
              ? 'กดปุ่ม “เชิญผู้ดูแล” เพื่อเพิ่มทีม'
              : 'ลองปรับคำค้นหาหรือตัวกรอง',
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
      />

      {inviting && (
        <InviteForm
          existingUsernames={admins.map((a) => a.username)}
          onInvite={handleInvite}
          onClose={() => setInviting(false)}
        />
      )}

      {editing && (
        <EditRoleForm
          admin={editing}
          onSave={handleEditRole}
          onClose={() => setEditing(null)}
        />
      )}

      {statusTarget && (
        <ConfirmDialog
          title={
            statusTarget.status === 'Active'
              ? 'ยืนยันการระงับบัญชี'
              : 'ยืนยันการเปิดใช้งาน'
          }
          description={
            statusTarget.status === 'Active'
              ? `ระงับบัญชี "${statusTarget.username}"? ผู้ดูแลรายนี้จะเข้าระบบไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง`
              : `เปิดใช้งานบัญชี "${statusTarget.username}" ให้กลับมาเข้าระบบได้?`
          }
          confirmLabel={statusTarget.status === 'Active' ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
          tone={statusTarget.status === 'Active' ? 'danger' : 'primary'}
          onConfirm={handleToggleStatus}
          onClose={() => setStatusTarget(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="ยืนยันการลบบัญชีผู้ดูแล"
          description={
            <>ลบบัญชี “{deleting.username}”? การลบไม่สามารถย้อนกลับได้</>
          }
          confirmLabel="ลบบัญชี"
          tone="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}

      <Toast message={message} />
    </div>
  )
}

/* ── Icon action button (stops row-level handlers) ──────────────────────── */

function IconButton({
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
      title={label}
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

/* ── Filter pill group ──────────────────────────────────────────────────── */

function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-line bg-panel p-1">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? 'bg-primary-subtle text-primary'
                : 'text-ink-secondary hover:bg-surface hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Role selector (shared by invite + edit) ────────────────────────────── */

function RoleSelector({
  value,
  onChange,
  name,
}: {
  value: AdminRole
  onChange: (role: AdminRole) => void
  name: string
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="บทบาท">
      {ADMIN_ROLES.map((role) => {
        const selected = value === role
        return (
          <label
            key={role}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
              selected
                ? 'border-primary bg-primary-subtle'
                : 'border-line bg-panel hover:bg-surface'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={role}
              checked={selected}
              onChange={() => onChange(role)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">{ROLE_INFO[role].label}</span>
              <span className="text-xs text-ink-muted">{ROLE_INFO[role].description}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

/* ── Invite form (modal) ────────────────────────────────────────────────── */

function InviteForm({
  existingUsernames,
  onInvite,
  onClose,
}: {
  existingUsernames: string[]
  onInvite: (invite: AdminInvite) => void
  onClose: () => void
}) {
  const titleId = useId()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<AdminRole>('VERIFIER')
  const [touched, setTouched] = useState(false)

  const trimmed = username.trim()
  const taken = existingUsernames.some(
    (u) => u.toLowerCase() === trimmed.toLowerCase(),
  )
  const errorMessage =
    trimmed.length < 3
      ? 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
      : taken
        ? 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
        : null
  const showError = touched && errorMessage !== null

  function submit() {
    setTouched(true)
    if (errorMessage !== null) return
    onInvite({ username: trimmed, role })
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          เชิญผู้ดูแลใหม่
        </h2>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <label htmlFor="admin-username" className="mb-1.5 block text-sm font-medium text-ink">
            ชื่อผู้ใช้ (username) <span className="text-error">*</span>
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="เช่น verify.somchai"
            autoComplete="off"
            aria-invalid={showError}
            className={`h-10 w-full rounded-lg border bg-panel px-3 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted transition-shadow focus:outline-none focus:ring-2 ${
              showError
                ? 'border-error-border focus:border-error focus:ring-error/15'
                : 'border-line focus:border-primary focus:ring-primary/15'
            }`}
          />
          {showError && <p className="mt-1 text-xs text-error">{errorMessage}</p>}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">บทบาท</p>
          <RoleSelector value={role} onChange={setRole} name="invite-role" />
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
          ส่งคำเชิญ
        </button>
      </div>
    </Modal>
  )
}

/* ── Edit role form (modal) ─────────────────────────────────────────────── */

function EditRoleForm({
  admin,
  onSave,
  onClose,
}: {
  admin: AdminUser
  onSave: (role: AdminRole) => void
  onClose: () => void
}) {
  const titleId = useId()
  const [role, setRole] = useState<AdminRole>(admin.role)

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          แก้ไขบทบาท ·{' '}
          <span className="font-mono text-sm text-ink-secondary">{admin.username}</span>
        </h2>
      </div>

      <div className="overflow-y-auto px-6 py-5">
        <RoleSelector value={role} onChange={setRole} name="edit-role" />
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
          onClick={() => onSave(role)}
          disabled={role === admin.role}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          บันทึกบทบาท
        </button>
      </div>
    </Modal>
  )
}
