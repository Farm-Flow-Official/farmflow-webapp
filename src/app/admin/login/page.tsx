import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/LoginForm'

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
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 3C16 3 5 10 5 19C5 24.5 9.5 29 16 29C22.5 29 27 24.5 27 19C27 10 16 3 16 3Z"
                fill="#004C22"
                fillOpacity="0.12"
                stroke="#004C22"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M16 29V15M16 15C16 15 20.5 17.5 23 22"
                stroke="#004C22"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
