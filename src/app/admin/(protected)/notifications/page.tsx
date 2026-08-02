import type { Metadata } from 'next'
import {
  fetchNotificationSummary,
  fetchNotifications,
} from '@/features/notifications/services/fetchNotifications'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { fetchLiveAnnouncements } from '@/features/announcements/services/fetchLiveAnnouncements'
import {
  NOTIFICATION_PAGE_SIZE,
  type NotificationType,
} from '@/features/notifications/types'

export const metadata: Metadata = {
  title: 'การแจ้งเตือน — FarmFlow Admin',
}

type Search = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Search
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(one(sp.page) ?? 1))
  const rawType = one(sp.type)
  // "announcement" is a pill on this page, not a notification type the API
  // knows — sending it would be a guaranteed 422 for a filter we handle here.
  const type = (
    rawType && rawType !== 'announcement' ? rawType : undefined
  ) as NotificationType | undefined

  // The announcements come along because the bell carries them: a reader who
  // saw a notice in the dropdown must find it again on the page that dropdown
  // links to, or "ดูทั้งหมด" is a lie.
  const [feed, summary, announcements] = await Promise.all([
    fetchNotifications('admin', {
      limit: NOTIFICATION_PAGE_SIZE,
      offset: (page - 1) * NOTIFICATION_PAGE_SIZE,
      unreadOnly: one(sp.unread) === '1',
      type,
    }),
    fetchNotificationSummary('admin'),
    fetchLiveAnnouncements('admin', 'bell'),
  ])

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          การแจ้งเตือน
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          งานที่รอคุณ · สัญญาณผิดปกติของข้อมูล · คำตัดสินของทีม · ความเคลื่อนไหวของระบบ
        </p>
      </header>

      <NotificationList
        surface="admin"
        rows={feed.rows}
        total={feed.total}
        page={page}
        summary={summary}
        announcements={announcements}
      />
    </div>
  )
}
