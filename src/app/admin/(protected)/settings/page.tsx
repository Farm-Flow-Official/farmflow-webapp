import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { getAdminSession } from '@/features/auth/services/adminSession'
import { fetchSystemConfig } from '@/features/settings/services/fetchSystemConfig'
import { canManageSettings } from '@/features/settings/permissions'
import { SettingsForm } from '@/features/settings/components/SettingsForm'

export const metadata: Metadata = {
  title: 'Settings — FarmFlow Admin',
}

export default async function SettingsPage() {
  const [config, admin] = await Promise.all([
    fetchSystemConfig(),
    getAdminSession(),
  ])

  // The protected layout already guarantees a session; this is a type guard.
  const canManage = admin ? canManageSettings(admin) : false

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          System Settings
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          ตั้งค่าตัวแปรระดับระบบ
        </p>
      </header>

      {canManage ? (
        <SettingsForm config={config} currentAdminUsername={admin?.username ?? 'admin'} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-[13px] text-ink-muted">
            เฉพาะ Super Admin เท่านั้นที่ตั้งค่าระบบได้
          </p>
        </div>
      )}
    </div>
  )
}
