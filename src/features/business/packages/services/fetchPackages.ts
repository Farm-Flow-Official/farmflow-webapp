import type { Package } from '@/features/business/packages/types'
import { mockPackages } from '@/features/business/packages/data/mockPackages'

/**
 * Single data seam for the tier catalog. Today it returns mock data ordered by
 * `sortOrder`; when the API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/business/packages`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: Package[] }
 *   return json.data ?? []
 */
export async function fetchPackages(): Promise<Package[]> {
  return [...mockPackages].sort((a, b) => a.sortOrder - b.sortOrder)
}
