'use client'

import { LogOut } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { NotificationBell } from '@/components/ui/notification-bell'
import { signOutExecutive } from '@/features/executive/auth/actions'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'
import type { ExecutiveProfile } from '@/features/executive/auth/types'

/**
 * A thin bar for the executive dashboard.
 *
 * This view is one page, not a portal, so it gets no sidebar — but it does need
 * the three things a signed-in view owes its reader: whose session this is, a
 * way out of it, and the announcements aimed at them. Before this existed the
 * board had no visible session at all, because they were borrowing the admin's.
 */
export function ExecutiveTopbar({
  profile,
  announcements,
}: {
  profile: ExecutiveProfile
  announcements: LiveAnnouncement[]
}) {
  const initial = profile.username?.charAt(0).toUpperCase() || 'E'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-panel/90 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2.5">
        <Logo size={26} />
        <div className="leading-none">
          <p className="text-base font-semibold tracking-tight text-primary">FarmFlow</p>
          <p className="mt-1 text-[10px] text-ink-muted">Executive Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Announcements only: this dashboard owns no queue and raises no MRV
            signals, so there is no system feed for it to poll. */}
        <NotificationBell announcements={announcements} />

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:inline">{profile.username}</span>
        </div>

        <form action={signOutExecutive}>
          <button
            type="submit"
            aria-label="ออกจากระบบ"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} />
          </button>
        </form>
      </div>
    </header>
  )
}
