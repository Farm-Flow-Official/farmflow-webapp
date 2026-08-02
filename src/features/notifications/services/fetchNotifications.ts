import { api } from '@/lib/api'
import type {
  NotificationSummary,
  NotificationSurface,
  NotificationType,
  StaffNotification,
} from '@/features/notifications/types'

export type NotificationPage = {
  rows: StaffNotification[]
  total: number
}

type Query = {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  type?: NotificationType
}

/**
 * One console's notifications.
 *
 * The two surfaces are separate paths on the API — same shape, different cookie
 * — so the branch is written out rather than templated: a string built at
 * runtime would compile, then silently ask the wrong API for the wrong
 * console's feed the first time someone mistyped the surface.
 *
 * Returns an empty page on failure. A bell that cannot load must not be what
 * takes a dashboard down; the work it points at is still reachable from the
 * menu.
 */
export async function fetchNotifications(
  surface: NotificationSurface,
  query: Query = {},
): Promise<NotificationPage> {
  // openapi-fetch expects `{ params: { query } }`. Passing `{ query }` at the
  // top level type-checks — the option bag is loosely typed — and is then
  // silently ignored, so every request went out bare: no limit, no offset, no
  // filters. The list still looked plausible, which is why it survived a
  // review: the API's defaults answered, and only the "unread only" filter was
  // obviously wrong.
  const params = { params: { query } }

  try {
    const { data } =
      surface === 'admin'
        ? await api.GET('/api/v1/admin/notifications/', params)
        : await api.GET('/api/v1/verifier/notifications/', params)

    if (!data?.success) return { rows: [], total: 0 }
    return {
      rows: data.data.rows as StaffNotification[],
      // The generated types widen integers to `string | number`; leaving it a
      // string would make the pager's `Math.ceil(total / size)` quietly wrong.
      total: Number(data.data.total),
    }
  } catch {
    return { rows: [], total: 0 }
  }
}

/** Just the badge number. Cheap enough to poll. */
export async function fetchUnreadCount(surface: NotificationSurface): Promise<number> {
  try {
    const { data } =
      surface === 'admin'
        ? await api.GET('/api/v1/admin/notifications/unread-count', {})
        : await api.GET('/api/v1/verifier/notifications/unread-count', {})

    return data?.success ? data.data.unread : 0
  } catch {
    return 0
  }
}

/** Per-type totals behind the filter pills. */
export async function fetchNotificationSummary(
  surface: NotificationSurface,
): Promise<NotificationSummary[]> {
  try {
    const { data } =
      surface === 'admin'
        ? await api.GET('/api/v1/admin/notifications/summary', {})
        : await api.GET('/api/v1/verifier/notifications/summary', {})

    return data?.success ? (data.data as NotificationSummary[]) : []
  } catch {
    return []
  }
}
