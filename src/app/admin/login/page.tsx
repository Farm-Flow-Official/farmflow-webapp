import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Logo } from '@/components/ui/logo'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — FarmFlow Admin',
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F9] p-6">
      <div className="w-full max-w-[440px] rounded-xl border border-[#E4E7EB] bg-white px-12 py-12 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">

        {/* ── Logo ── */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-xl font-semibold tracking-tight text-[#004C22]">
              FarmFlow
            </span>
          </div>
          <span className="text-xs text-[#9CA3AF]">Admin Dashboard</span>
        </div>

        {/* ── Form ── */}
        <LoginForm />

        {/* ── Footer ── */}
        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          FarmFlow Carbon Platform · Internal Access Only
        </p>
      </div>
    </main>
  )
}
