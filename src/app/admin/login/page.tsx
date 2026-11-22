import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Logo } from '@/components/ui/logo'
import { BackToPortals } from '@/components/ui/back-to-portals'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — FarmFlow Admin',
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[440px]">
        <BackToPortals className="mb-3 -ml-2" />

        <div className="rounded-xl border border-line bg-panel px-12 py-12 shadow-md">

          {/* ── Logo ── */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-xl font-semibold tracking-tight text-primary">
                FarmFlow
              </span>
            </div>
            <span className="text-xs text-ink-muted">Flow Control</span>
          </div>

          {/* ── Form ── */}
          <LoginForm />

          {/* ── Footer ── */}
          <p className="mt-6 text-center text-xs text-ink-muted">
            FarmFlow Carbon Platform · Internal Access Only
          </p>
        </div>
      </div>
    </main>
  )
}
