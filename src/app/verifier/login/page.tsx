import type { Metadata } from 'next'
import { VerifierLoginForm } from '@/features/verifier/components/VerifierLoginForm'
import { Logo } from '@/components/ui/logo'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — FarmFlow Verifier',
}

export default function VerifierLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-panel px-12 py-12 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
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
