import type { PaymentSlip } from '@/features/business/payments/types'
import { mockPaymentSlips } from '@/features/business/payments/data/mockPaymentSlips'

/**
 * Single data seam for the slip-verification queue. Today it returns mock data
 * newest-first; when the API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardCookieHeader()   // export from adminSession.ts
 *   const res = await fetch(`${apiBase}/business/payments`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: PaymentSlip[] }
 *   return json.data ?? []
 */
export async function fetchPaymentSlips(): Promise<PaymentSlip[]> {
  return [...mockPaymentSlips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
