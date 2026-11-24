'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import {
  fetchNotifications,
  fetchUnreadCount,
} from '@/features/notifications/services/fetchNotifications'
import {
  NOTIFICATION_BELL_SIZE,
  type NotificationSurface,
  type StaffNotification,
} from '@/features/notifications/types'

export type BellSnapshot = {
  unread: number
  rows: StaffNotification[]
}

/**
 * What the bell shows, fetched together.
 *
 * The client polls this on an interval and on regaining focus. Two round trips
 * would let the badge and the list disagree — a count of 3 over a list of 2 is
 * the kind of small wrongness that makes people stop trusting the feature.
 */
export async function pollBell(surface: NotificationSurface): Promise<BellSnapshot> {
  const [unread, page] = await Promise.all([
    fetchUnreadCount(surface),
    fetchNotifications(surface, { limit: NOTIFICATION_BELL_SIZE, offset: 0 }),
  ])

  return { unread, rows: page.rows }
}

/**
 * Mark one read.
 *
 * Returns the fresh snapshot rather than a bare ok, so the bell updates from
 * the server's answer instead of guessing what the server did.
 */
export async function markNotificationRead(
  surface: NotificationSurface,
  id: string,
): Promise<BellSnapshot> {
  try {
    if (surface === 'admin') {
      await api.PATCH('/api/v1/admin/notifications/{id}/read', { params: { path: { id } } })
    } else {
      await api.PATCH('/api/v1/verifier/notifications/{id}/read', { params: { path: { id } } })
    }
  } catch {
    // Fall through: the snapshot below tells the truth either way.
  }

  revalidatePath(`/${surface}/notifications`)
  return pollBell(surface)
}

/** Clear everything currently visible. */
export async function markAllNotificationsRead(
  surface: NotificationSurface,
): Promise<BellSnapshot> {
  try {
    if (surface === 'admin') {
      await api.POST('/api/v1/admin/notifications/read-all', {})
    } else {
      await api.POST('/api/v1/verifier/notifications/read-all', {})
    }
  } catch {
    // Same as above — the caller re-reads rather than trusting this call.
  }

  revalidatePath(`/${surface}/notifications`)
  return pollBell(surface)
}
