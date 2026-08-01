'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useStoredIds } from '@/lib/hooks/useStoredIds'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'

/** Announcements the viewer has already opened, so the dot reflects *new* ones. */
const SEEN_KEY = 'farmflow.announcements.seen'

/**
 * The announcement bell in a dashboard's topbar (ADMIN-ANN-02).
 *
 * Announcements arrive from the server already filtered to this dashboard and
 * this moment, so the bell only decides what is *new* to this viewer. That is
 * kept in localStorage rather than the database: "have I read this" is a
 * per-device convenience, and giving it a table would mean a write on every
 * dropdown open for something nobody audits.
 */
export function AnnouncementBell({ announcements }: { announcements: LiveAnnouncement[] }) {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useStoredIds(SEEN_KEY)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (announcements.length === 0) return null

  const unread = announcements.filter((a) => !seen.includes(a.id)).length

  function toggle() {
    const next = !open
    setOpen(next)
    // Opening is the acknowledgement — marking them read on close would leave
    // the dot up while the reader is looking straight at the list.
    if (next) setSeen(announcements.map((a) => a.id))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `ประกาศ (${unread} รายการใหม่)` : 'ประกาศ'}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={1.9} />
        {unread > 0 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white"
            aria-hidden
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="ประกาศ"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-panel shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="text-[13px] font-semibold text-ink">ประกาศ</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิด"
              className="rounded p-0.5 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
            {announcements.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{a.title}</p>
                <p className="mt-0.5 whitespace-pre-line text-[12px] leading-relaxed text-ink-secondary">
                  {a.body}
                </p>
                <p className="mt-1 text-[11px] text-ink-muted">{formatDate(a.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
