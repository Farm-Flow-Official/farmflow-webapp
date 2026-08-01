'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Megaphone, X } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { useStoredIds } from '@/lib/hooks/useStoredIds'
import {
  markAllNotificationsRead,
  markNotificationRead,
  pollBell,
  type BellSnapshot,
} from '@/features/notifications/actions/notificationActions'
import {
  NOTIFICATION_KINDS,
  type NotificationSurface,
  type StaffNotification,
} from '@/features/notifications/types'
import type { LiveAnnouncement } from '@/features/announcements/types/targets'

/** Announcements the viewer has already opened, so the dot reflects *new* ones. */
const SEEN_KEY = 'farmflow.announcements.seen'

/** How often the badge re-checks with the server. */
const POLL_MS = 60_000

/**
 * The one bell in a staff dashboard's topbar.
 *
 * It carries two feeds that arrive by different routes: announcements an admin
 * wrote by hand, and notices the system raised about work and data. Nobody
 * reading a bell distinguishes those, so they share one button and one badge —
 * two bells side by side would have made the reader decide which one to check,
 * which is precisely the decision a notification exists to save them.
 *
 * They keep separate read state for a real reason. An announcement is read when
 * you have seen it, which is a per-device convenience kept in localStorage. A
 * system notice is read by *this account*, recorded server-side, because the
 * queue it points at is shared work and "I have looked at this" has to survive
 * moving to another machine.
 *
 * Polling rather than streaming: at a 60-second beat this costs one small query
 * per open tab per minute, and the events it carries — a farm waiting for
 * approval, a session queued for review — are hours of work, not seconds. An
 * SSE connection per admin through Traefik would be more moving parts for a
 * freshness nobody asked for.
 */
export function NotificationBell({
  surface,
  announcements,
  initial,
  seeAllHref,
}: {
  surface: NotificationSurface
  announcements: LiveAnnouncement[]
  initial: BellSnapshot
  seeAllHref: string
}) {
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] = useState(initial)
  const [seen, setSeen] = useStoredIds(SEEN_KEY)
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    void pollBell(surface).then(setSnapshot)
  }, [surface])

  // Poll on a timer, and again whenever the tab comes back — someone returning
  // to a dashboard they left open at lunch should not wait out the interval to
  // find out what happened while they were gone.
  useEffect(() => {
    const timer = setInterval(refresh, POLL_MS)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

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

  const unseenAnnouncements = announcements.filter((a) => !seen.includes(a.id)).length
  const unread = snapshot.unread + unseenAnnouncements
  const empty = announcements.length === 0 && snapshot.rows.length === 0

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      // Opening acknowledges the announcements — they have no action to take,
      // so leaving the dot up while the reader looks straight at them would be
      // nagging. System notices are dismissed one at a time instead: each one
      // stands for work that may not be done yet.
      setSeen(announcements.map((a) => a.id))
      refresh()
    }
  }

  function dismiss(id: string) {
    startTransition(async () => setSnapshot(await markNotificationRead(surface, id)))
  }

  function dismissAll() {
    startTransition(async () => setSnapshot(await markAllNotificationsRead(surface)))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `การแจ้งเตือน (${unread} รายการใหม่)` : 'การแจ้งเตือน'}
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
          aria-label="การแจ้งเตือน"
          className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-panel shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <h2 className="text-[13px] font-semibold text-ink">การแจ้งเตือน</h2>
            <div className="flex items-center gap-1">
              {snapshot.unread > 0 && (
                <button
                  type="button"
                  onClick={dismissAll}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  อ่านทั้งหมด
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="rounded p-0.5 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {empty && (
              <p className="px-4 py-6 text-center text-[12px] text-ink-muted">
                ยังไม่มีการแจ้งเตือน
              </p>
            )}

            {snapshot.rows.length > 0 && (
              <ul className="divide-y divide-line">
                {snapshot.rows.map((n) => (
                  <NoticeRow
                    key={n.id}
                    notice={n}
                    onOpen={() => {
                      dismiss(n.id)
                      setOpen(false)
                    }}
                    onDismiss={() => dismiss(n.id)}
                    busy={pending}
                  />
                ))}
              </ul>
            )}

            {announcements.length > 0 && (
              <>
                <p className="flex items-center gap-1.5 border-y border-line bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  <Megaphone className="h-3 w-3" strokeWidth={2} />
                  ประกาศจากผู้ดูแลระบบ
                </p>
                <ul className="divide-y divide-line">
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
              </>
            )}
          </div>

          <Link
            href={seeAllHref}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-[12px] font-medium text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ดูการแจ้งเตือนทั้งหมด
          </Link>
        </div>
      )}
    </div>
  )
}

function NoticeRow({
  notice,
  onOpen,
  onDismiss,
  busy,
}: {
  notice: StaffNotification
  onOpen: () => void
  onDismiss: () => void
  busy: boolean
}) {
  const kind = NOTIFICATION_KINDS[notice.notificationType]
  const Icon = kind.icon

  const inner = (
    <>
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${kind.tone}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-ink">{notice.title}</span>
        {notice.body && (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-secondary">
            {notice.body}
          </span>
        )}
        <span className="mt-1 block text-[11px] text-ink-muted" suppressHydrationWarning>
          {formatRelativeTime(notice.createdAt)}
        </span>
      </span>
      {!notice.isRead && <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${kind.dot}`} />}
    </>
  )

  return (
    <li className={notice.isRead ? 'opacity-60' : ''}>
      {notice.href ? (
        <Link
          href={notice.href}
          onClick={onOpen}
          className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {inner}
        </button>
      )}
    </li>
  )
}
