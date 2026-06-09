'use client'

import { useActionState } from 'react'
import { loginVerifier } from '@/features/verifier/auth/actions'
import type { VerifierLoginState } from '@/features/verifier/auth/types'

export function VerifierLoginForm() {
  const [state, action, pending] = useActionState<VerifierLoginState, FormData>(
    loginVerifier,
    undefined,
  )

  return (
    <form action={action} noValidate>
      {state?.error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-md border border-error-border bg-error-bg px-4 py-3"
        >
          <svg className="mt-0.5 size-4 shrink-0 text-error" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-error">{state.error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            ชื่อผู้ใช้
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="verifier"
            className="h-11 w-full rounded-md border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            รหัสผ่าน
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-11 w-full rounded-md border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
      </button>

      <p className="mt-4 text-center text-xs text-ink-muted">
        BETA: ใส่ชื่อผู้ใช้/รหัสผ่านอะไรก็ได้ (mock session)
      </p>
    </form>
  )
}
