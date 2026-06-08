import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchAdmins } from '@/features/admin-users/services/fetchAdmins'
import { canManageAdmins } from '@/features/admin-users/permissions'
import { AdminUserManager } from '@/features/admin-users/components/AdminUserManager'

export const metadata: Metadata = {
  title: 'Admin Users — FarmFlow Admin',
}

export default async function AdminUsersPage() {
  const [admins, admin] = await Promise.all([fetchAdmins(), getAdminSession()])

  // The protected layout already guarantees a session; this is a type guard.
  const canManage = admin ? canManageAdmins(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Admin Users
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          จัดการบัญชีผู้ดูแลระบบและบทบาทการเข้าถึง
        </p>
      </header>

      {canManage ? (
        <AdminUserManager
          // Spec A-12: list excludes the current admin — they cannot act on
          // their own account (suspend/delete self is disallowed).
          initialAdmins={admins.filter((a) => a.id !== admin?.id)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            เฉพาะ Super Admin เท่านั้นที่จัดการผู้ดูแลระบบได้
          </p>
        </div>
      )}
    </div>
  )
}
