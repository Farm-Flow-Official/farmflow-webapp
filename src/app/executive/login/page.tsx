import type { Metadata } from 'next'
import { ExecutiveLoginForm } from '@/features/executive/components/ExecutiveLoginForm'
import { Logo } from '@/components/ui/logo'
import { MaintenanceScreen } from '@/components/ui/maintenance-screen'
import { checkDashboard } from '@/features/settings/services/fetchAvailability'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — FarmFlow Executive',
}

export default async function ExecutiveLoginPage() {
  // Signing in to a closed portal only leads to the maintenance screen anyway —
  // say so here instead of taking a password first (ADMIN-SYS-01).
  const closed = await checkDashboard('executive')
  if (closed) {
    return (
      <MaintenanceScreen
        title="Executive Dashboard"
        reason={closed.reason}
        expectedBackAt={closed.expectedBackAt}
      />
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-panel px-12 py-12 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-xl font-semibold tracking-tight text-primary">FarmFlow</span>
          </div>
          <span className="text-xs text-ink-muted">Executive Dashboard</span>
        </div>

        <ExecutiveLoginForm />

        <p className="mt-6 text-center text-xs text-ink-muted">
          FarmFlow Carbon Platform · Executive Access
        </p>
      </div>
    </main>
  )
}
