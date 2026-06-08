import type { AdminUser } from '@/features/admin-users/types'
import { mockAdmins } from '@/features/admin-users/data/mockAdmins'

/**
 * Single data seam for the admin-user list. Today it returns mock data sorted
 * newest-first; when the admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/admins`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: AdminUser[] }
 *   return json.data ?? []
 */
export async function fetchAdmins(): Promise<AdminUser[]> {
  return [...mockAdmins].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
