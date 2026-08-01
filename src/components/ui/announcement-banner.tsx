'use client'

import { Megaphone, X } from 'lucide-react'
import { useStoredIds } from '@/lib/hooks/useStoredIds'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'

const DISMISSED_KEY = 'farmflow.announcements.dismissed'

/**
 * The banner form of an announcement (ADMIN-ANN-02) — for things that should be
 * seen now, not found later.
 *
 * Dismissible, and the dismissal sticks per device: a banner that reappears on
 * every navigation stops being read within a day. It stays dismissed only for
 * that announcement id, so the next one is not silently swallowed.
 *
 * Only the newest is shown. Two stacked banners compete rather than inform, and
 * the rest are still in the bell.
 */
export function AnnouncementBanner({ announcements }: { announcements: LiveAnnouncement[] }) {
  const [dismissed, setDismissed] = useStoredIds(DISMISSED_KEY)

  const current = announcements.find((a) => !dismissed.includes(a.id))
  if (!current) return null

  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-primary/20 bg-primary-subtle px-4 py-3 sm:px-8"
    >
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.9} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">{current.title}</p>
        <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-secondary">
          {current.body}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed([...dismissed, current.id])}
        aria-label="ปิดประกาศนี้"
        className="shrink-0 rounded p-1 text-ink-muted transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
