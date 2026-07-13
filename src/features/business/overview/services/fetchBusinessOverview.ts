import type { BusinessOverview } from '@/features/business/overview/types'
import { mockOverview } from '@/features/business/overview/data/mockOverview'

/**
 * Single data seam for the business overview. Today it returns a mock aggregate;
 * when the API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/business/overview`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) throw new Error('overview unavailable')
 *   const json = (await res.json()) as { data: BusinessOverview }
 *   return json.data
 */
export async function fetchBusinessOverview(): Promise<BusinessOverview> {
  return mockOverview
}
