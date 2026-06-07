import type { FarmerDetail } from '@/features/farmers/types'
import { mockFarmerDetails } from '@/features/farmers/data/mockFarmerDetails'

/**
 * Single data seam for a farmer detail. Today it returns mock data; when the
 * admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // see adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/farmers/${encodeURIComponent(id)}`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (res.status === 404) return null
 *   if (!res.ok) return null
 *   const json = (await res.json()) as { data?: FarmerDetail }
 *   return json.data ?? null
 */
export async function fetchFarmerById(id: string): Promise<FarmerDetail | null> {
  return mockFarmerDetails[id] ?? null
}
