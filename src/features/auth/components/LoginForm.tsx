'use client'

import { useActionState } from 'react'
import { loginAdmin } from '@/features/auth/actions/loginAdmin'
import type { LoginState } from '@/features/auth/types'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAdmin,
    undefined,
  )

  return (
    <form action={action} noValidate>
      {state?.error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
        >
          <svg
            className="mt-0.5 size-4 shrink-0 text-[#991B1B]"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 5v3.5M8 11h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm font-medium text-[#991B1B]">{state.error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-[13px] font-medium text-[#374151]"
          >
            ชื่อผู้ใช้
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="admin"
            className="h-11 w-full rounded-md border border-[#E4E7EB] bg-white px-3.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:border-[#004C22] focus:ring-[3px] focus:ring-[#004C22]/8 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[13px] font-medium text-[#374151]"
          >
            รหัสผ่าน
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-11 w-full rounded-md border border-[#E4E7EB] bg-white px-3.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:border-[#004C22] focus:ring-[3px] focus:ring-[#004C22]/8 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#C8000E] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#A80009] focus:outline-none focus:ring-2 focus:ring-[#C8000E] focus:ring-offset-2 active:bg-[#8C0008] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <svg
              className="size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            กำลังเข้าสู่ระบบ…
          </span>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </button>
    </form>
  )
}
