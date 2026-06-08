import type { Announcement } from '@/features/announcements/types'
import { mockAnnouncements } from '@/features/announcements/data/mockAnnouncements'

/**
 * Single data seam for the announcement list. Today it returns mock data sorted
 * newest-first; when the admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/announcements`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: Announcement[] }
 *   return json.data ?? []
 */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  return [...mockAnnouncements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
