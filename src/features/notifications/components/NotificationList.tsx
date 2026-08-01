'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BellOff, CheckCheck } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { markAllNotificationsRead } from '@/features/notifications/actions/notificationActions'
import {
  NOTIFICATION_KINDS,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_TYPES,
  type NotificationSummary,
  type NotificationSurface,
  type StaffNotification,
} from '@/features/notifications/types'

/**
 * The full notification history for one console.
 *
 * The bell answers "what is new"; this answers "what happened, and did anyone
 * deal with it". Filters live in the URL so a link to "unread MRV signals" can
 * be sent to a colleague — the state worth sharing is the state worth putting
 * in the address bar.
 */
export function NotificationList({
  surface,
  rows,
  total,
  page,
  summary,
}: {
  surface: NotificationSurface
  rows: StaffNotification[]
  total: number
  page: number
  summary: NotificationSummary[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const activeType = params.get('type') ?? 'all'
  const unreadOnly = params.get('unread') === '1'
  const totalUnread = summary.reduce((sum, s) => sum + s.unread, 0)

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value === null) next.delete(key)
    else next.set(key, value)
    // Any *filter* change invalidates the page number — page 3 of a narrower
    // list is usually empty, and an empty screen reads as "nothing happened".
    // Paging itself is exempt, or the pager would erase its own destination.
    if (key !== 'page') next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  function clearAll() {
    startTransition(async () => {
      await markAllNotificationsRead(surface)
      router.refresh()
    })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pill active={activeType === 'all'} onClick={() => setParam('type', null)}>
          ทั้งหมด
        </Pill>
        {NOTIFICATION_TYPES.map((type) => {
          const kind = NOTIFICATION_KINDS[type]
          const stat = summary.find((s) => s.notificationType === type)
          return (
            <Pill key={type} active={activeType === type} onClick={() => setParam('type', type)}>
              {kind.label}
              {stat && stat.unread > 0 && (
                <span className={`ml-1.5 h-1.5 w-1.5 rounded-full ${kind.dot}`} aria-hidden />
              )}
            </Pill>
          )
        })}

        <span className="mx-1 h-5 w-px bg-line" aria-hidden />

        <Pill active={unreadOnly} onClick={() => setParam('unread', unreadOnly ? null : '1')}>
          เฉพาะที่ยังไม่อ่าน
        </Pill>

        {totalUnread > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={pending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
            อ่านทั้งหมด ({totalUnread})
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-panel py-16 text-center">
          <BellOff className="h-8 w-8 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-secondary">ไม่มีการแจ้งเตือน</p>
          <p className="text-[13px] text-ink-muted">
            {unreadOnly || activeType !== 'all'
              ? 'ลองล้างตัวกรองเพื่อดูรายการทั้งหมด'
              : 'เมื่อมีงานค้างหรือสัญญาณผิดปกติ จะแสดงที่นี่'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {rows.map((n) => {
            const kind = NOTIFICATION_KINDS[n.notificationType]
            const Icon = kind.icon
            return (
              <li key={n.id} className={`flex items-start gap-3 px-5 py-4 ${n.isRead ? 'opacity-60' : ''}`}>
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${kind.tone}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                    {n.title}
                    {!n.isRead && (
                      <span className={`h-1.5 w-1.5 rounded-full ${kind.dot}`} aria-label="ยังไม่อ่าน" />
                    )}
                  </p>
                  {n.body && (
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">{n.body}</p>
                  )}
                  <p className="mt-1 text-[11px] text-ink-muted">
                    <span suppressHydrationWarning>{formatRelativeTime(n.createdAt)}</span>
                    <span className="mx-1.5">·</span>
                    <span suppressHydrationWarning>{formatDateTime(n.createdAt)}</span>
                  </p>
                </div>

                {n.href && (
                  <Link
                    href={n.href}
                    className="shrink-0 self-center rounded-lg border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    เปิดดู
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={NOTIFICATION_PAGE_SIZE}
        onPageChange={(next) => setParam('page', String(next))}
      />
    </>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? 'border-primary bg-primary-subtle text-primary'
          : 'border-line bg-panel text-ink-secondary hover:bg-surface hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
