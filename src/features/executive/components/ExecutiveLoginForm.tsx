'use client'

import { useActionState } from 'react'
import { ExternalLink } from 'lucide-react'
import { loginExecutive } from '@/features/executive/auth/actions'
import { PasswordInput } from '@/components/ui/password-input'
import { LINE_OA_URL } from '@/lib/constants/contact'
import type { ExecutiveLoginState } from '@/features/executive/auth/types'

export function ExecutiveLoginForm() {
  const [state, action, pending] = useActionState<ExecutiveLoginState, FormData>(
    loginExecutive,
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
            placeholder="executive"
            className="h-11 w-full rounded-md border border-line bg-panel px-3.5 text-sm text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            รหัสผ่าน
          </label>
          <PasswordInput
            id="password"
            name="password"
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
        ใช้บัญชีผู้บริหารที่ผู้ดูแลระบบสร้างให้ (Executive)
      </p>

      <p className="mt-3 text-center text-[13px] text-ink-muted">
        เข้าสู่ระบบไม่ได้?{' '}
        <a
          href={LINE_OA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          ติดต่อผู้ดูแลระบบ
          <ExternalLink className="h-3 w-3" strokeWidth={2} aria-hidden />
          <span className="sr-only">(เปิดแท็บใหม่ไปยัง LINE Official Account)</span>
        </a>
      </p>
    </form>
  )
}
