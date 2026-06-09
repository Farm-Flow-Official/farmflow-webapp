import type { Metadata } from 'next'
import { VerifierLoginForm } from '@/features/verifier/components/VerifierLoginForm'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — FarmFlow Verifier',
}

export default function VerifierLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-panel px-12 py-12 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
            <span className="text-xl font-semibold tracking-tight text-primary">FarmFlow</span>
          </div>
          <span className="text-xs text-ink-muted">Verifier Portal</span>
        </div>

        <VerifierLoginForm />

        <p className="mt-6 text-center text-xs text-ink-muted">
          FarmFlow Carbon Platform · External Verifier Access
        </p>
      </div>
    </main>
  )
}
