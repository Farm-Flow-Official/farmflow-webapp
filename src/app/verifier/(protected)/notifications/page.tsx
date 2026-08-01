import type { Metadata } from 'next'
import {
  fetchNotificationSummary,
  fetchNotifications,
} from '@/features/notifications/services/fetchNotifications'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import {
  NOTIFICATION_PAGE_SIZE,
  type NotificationType,
} from '@/features/notifications/types'

export const metadata: Metadata = {
  title: 'การแจ้งเตือน — FarmFlow Verifier',
}

type Search = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export default async function VerifierNotificationsPage({
  searchParams,
}: {
  searchParams: Search
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(one(sp.page) ?? 1))
  const type = one(sp.type) as NotificationType | undefined

  const [feed, summary] = await Promise.all([
    fetchNotifications('verifier', {
      limit: NOTIFICATION_PAGE_SIZE,
      offset: (page - 1) * NOTIFICATION_PAGE_SIZE,
      unreadOnly: one(sp.unread) === '1',
      type,
    }),
    fetchNotificationSummary('verifier'),
  ])

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
          การแจ้งเตือน
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          รอบตรวจที่รอคุณ · สัญญาณผิดปกติจาก AI · ความเคลื่อนไหวของระบบ
        </p>
      </header>

      <NotificationList
        surface="verifier"
        rows={feed.rows}
        total={feed.total}
        page={page}
        summary={summary}
      />
    </div>
  )
}
