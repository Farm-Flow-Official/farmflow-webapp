'use client'

import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import type { BusinessProfile } from '@/features/business/auth/types'

type Props = {
  profile: BusinessProfile
  menuOpen?: boolean
  onMenuClick?: () => void
}

export function BusinessTopbar({ profile, menuOpen = false, onMenuClick }: Props) {
  const initial = profile.username?.charAt(0).toUpperCase() || 'B'

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-panel/90 px-4 backdrop-blur sm:px-6">
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="เปิด/ปิดเมนู"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          {menuOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <div className="leading-none">
            <p className="text-base font-semibold tracking-tight text-primary">FarmFlow</p>
            <p className="mt-1 text-[10px] text-ink-muted">Business Dashboard</p>
          </div>
        </div>
      </div>

      {/* Right: role badge · user · logout */}
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-primary-muted bg-primary-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success sm:inline">
          {profile.role}
        </span>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:inline">
            {profile.username}
          </span>
        </div>

        {/* Mock: no business auth yet — logout returns to the portal. */}
        <Link
          href="/"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </Link>
      </div>
    </header>
  )
}
