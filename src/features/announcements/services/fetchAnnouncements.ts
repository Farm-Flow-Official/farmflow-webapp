import { api, unwrap } from '@/lib/api'
import type { Announcement, AnnouncementStatus } from '@/features/announcements/types'

/** The announcement list, newest-first. */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const items = await unwrap(api.GET('/api/v1/admin/announcements/'))
  return items
    .map((a) => ({ ...a, status: a.status as AnnouncementStatus }))
    .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
}
