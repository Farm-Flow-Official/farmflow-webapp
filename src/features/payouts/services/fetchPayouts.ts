import type { PayoutRequest } from '@/features/payouts/types'
import { mockPayouts } from '@/features/payouts/data/mockPayouts'

/**
 * Single data seam for the payout queue. Today it returns mock data sorted
 * newest-first; when the admin API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/admin/payouts`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: PayoutRequest[] }
 *   return json.data ?? []
 */
export async function fetchPayouts(): Promise<PayoutRequest[]> {
  return [...mockPayouts].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  )
}
