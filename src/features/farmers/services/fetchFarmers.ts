import type { Farmer } from '@/features/farmers/types'
import { mockFarmers } from '@/features/farmers/data/mockFarmers'

/**
 * Single data seam for the farmer list. Today it returns mock data; when the
 * admin API is ready, replace ONLY the body below with a real fetch — every
 * caller already awaits this and consumes the `Farmer[]` contract unchanged.
 *
 * Ready-to-use replacement:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // see adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/farmers`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: Farmer[] }
 *   return json.data ?? []
 */
export async function fetchFarmers(): Promise<Farmer[]> {
  return mockFarmers
}
