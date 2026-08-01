import { api } from '@/lib/api'
import type {
  AnnouncementChannel,
  AnnouncementDashboard,
  LiveAnnouncement,
} from '@/features/announcements/types/targets'

export type { LiveAnnouncement }

/**
 * Announcements this dashboard should show right now (ADMIN-ANN-02).
 *
 * The window is evaluated on the server, so a scheduled notice appears without
 * the page having to re-render at the right minute — and a client clock that is
 * wrong cannot show something early.
 *
 * Returns [] on failure: a broken announcements feed must never be what stops a
 * dashboard from rendering.
 */
export async function fetchLiveAnnouncements(
  dashboard: AnnouncementDashboard,
  channel?: AnnouncementChannel,
): Promise<LiveAnnouncement[]> {
  try {
    const { data } = await api.GET('/api/v1/system/announcements', {
      params: { query: { dashboard, channel } },
    })
    return data?.success ? data.data : []
  } catch {
    return []
  }
}
