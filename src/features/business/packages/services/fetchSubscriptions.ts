import type { CustomerSubscription } from '@/features/business/packages/types'
import { mockSubscriptions } from '@/features/business/packages/data/mockSubscriptions'

/**
 * Single data seam for the customer subscription grid. Today it returns mock
 * data; when the API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/business/subscriptions`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: CustomerSubscription[] }
 *   return json.data ?? []
 */
export async function fetchSubscriptions(): Promise<CustomerSubscription[]> {
  return [...mockSubscriptions]
}
