import type { SystemConfig } from '@/features/settings/types'
import { mockSystemConfig } from '@/features/settings/data/mockSystemConfig'

/**
 * Single data seam for system settings. Today it returns mock data; when the
 * admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/system/settings`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return mockSystemConfig
 *   return (await res.json()) as SystemConfig
 */
export async function fetchSystemConfig(): Promise<SystemConfig> {
  return mockSystemConfig
}
