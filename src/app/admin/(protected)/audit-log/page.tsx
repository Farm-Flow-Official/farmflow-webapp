import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchAuditLogs } from '@/features/audit-logs/services/fetchAuditLogs'
import { canViewAuditLog } from '@/features/audit-logs/permissions'
import { AuditLogTable } from '@/features/audit-logs/components/AuditLogTable'

export const metadata: Metadata = {
  title: 'Audit Log — FarmFlow Admin',
}

export default async function AuditLogPage() {
  const [logs, admin] = await Promise.all([fetchAuditLogs(), getAdminSession()])

  // The protected layout already guarantees a session; this is a type guard.
  const canView = admin ? canViewAuditLog(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Audit Log
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          บันทึกกิจกรรมของระบบ · เพิ่มอย่างเดียว แก้ไข/ลบไม่ได้ (append-only)
        </p>
      </header>

      {canView ? (
        <AuditLogTable logs={logs} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            เฉพาะ Super Admin เท่านั้นที่ดูบันทึกกิจกรรมได้
          </p>
        </div>
      )}
    </div>
  )
}
