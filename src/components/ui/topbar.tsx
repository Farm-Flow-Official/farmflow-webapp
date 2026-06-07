import { LogOut } from 'lucide-react'
import type { AdminProfile } from '@/features/auth/types'
import { signOutAdmin } from '@/features/auth/actions/signOutAdmin'

type Props = { admin: AdminProfile }

export function AdminTopbar({ admin }: Props) {
  const initial = admin.username?.charAt(0).toUpperCase() || 'A'

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-panel/90 px-6 backdrop-blur">
      {/* Logo + subdomain label */}
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M16 3C16 3 5 10 5 19C5 24.5 9.5 29 16 29C22.5 29 27 24.5 27 19C27 10 16 3 16 3Z"
            fill="rgba(0,76,34,0.10)"
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
        <div className="leading-none">
          <p className="text-base font-semibold tracking-tight text-primary">FarmFlow</p>
          <p className="mt-1 text-[10px] text-ink-muted">Admin Dashboard</p>
        </div>
      </div>

      {/* Right: role badge · user · logout */}
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-primary-muted bg-primary-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success">
          Admin
        </span>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:inline">
            {admin.username}
          </span>
        </div>

        <form action={signOutAdmin}>
          <button
            type="submit"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </form>
      </div>
    </header>
  )
}
