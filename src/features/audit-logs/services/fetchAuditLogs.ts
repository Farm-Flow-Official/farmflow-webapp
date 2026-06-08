import type { AuditLog } from '@/features/audit-logs/types'
import { mockAuditLogs } from '@/features/audit-logs/data/mockAuditLogs'

/**
 * Single data seam for the audit log. Today it returns mock data sorted
 * newest-first; when the admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/audit-logs`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: AuditLog[] }
 *   return json.data ?? []
 */
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  return [...mockAuditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
