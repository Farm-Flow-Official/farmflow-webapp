import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import {
  fetchAuditFilters,
  fetchAuditLogs,
} from '@/features/audit-logs/services/fetchAuditLogs'
import { canViewAuditLog } from '@/features/audit-logs/permissions'
import { AuditLogTable } from '@/features/audit-logs/components/AuditLogTable'
import { AUDIT_PAGE_SIZE } from '@/features/audit-logs/types/page-size'

export const metadata: Metadata = {
  title: 'Audit Log — FarmFlow Admin',
}

type Search = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export default async function AuditLogPage({ searchParams }: { searchParams: Search }) {
  const [sp, admin] = await Promise.all([searchParams, getAdminSession()])

  // The protected layout already guarantees a session; this is a type guard.
  const canView = admin ? canViewAuditLog(admin) : false

  if (!canView) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <Header />
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            เฉพาะ Super Admin เท่านั้นที่ดูบันทึกกิจกรรมได้
          </p>
        </div>
      </div>
    )
  }

  const page = Math.max(1, Number(one(sp.page) ?? 1))
  const action = one(sp.action)

  const [logs, filters] = await Promise.all([
    fetchAuditLogs({
      q: one(sp.q),
      // "all" is the absence of a filter, not a value to send.
      action: action && action !== 'all' ? action : undefined,
      actorId: one(sp.actorId),
      from: one(sp.from),
      to: one(sp.to),
      sort: (one(sp.sort) as 'createdAt') ?? 'createdAt',
      dir: (one(sp.dir) as 'asc' | 'desc') ?? 'desc',
      limit: AUDIT_PAGE_SIZE,
      offset: (page - 1) * AUDIT_PAGE_SIZE,
    }),
    fetchAuditFilters(),
  ])

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <Header />
      <AuditLogTable page={logs} filters={filters} />
    </div>
  )
}

function Header() {
  return (
    <header className="mb-6">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
        Audit Log
      </h1>
      <p className="mt-1.5 text-sm text-ink-secondary">
        บันทึกกิจกรรมของระบบ · เพิ่มอย่างเดียว แก้ไข/ลบไม่ได้ (append-only)
      </p>
    </header>
  )
}
