import type { VerifierOverviewData } from '@/features/verifier/types'
import { mockVerifierOverview } from '@/features/verifier/data/mockVerifierOverview'

/**
 * Single data seam for the verifier dashboard (V-02). Today it returns mock
 * data; when the verifier API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardVerifierCookie()   // once verifier auth exists
 *   const res = await fetch(`${apiBase}/verifier/overview`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return { summary: {...zeros}, alerts: [] }
 *   return (await res.json()) as VerifierOverviewData
 */
export async function fetchVerifierOverview(): Promise<VerifierOverviewData> {
  // Smart sort: lowest AI confidence (most suspect) surfaces first.
  return {
    ...mockVerifierOverview,
    alerts: [...mockVerifierOverview.alerts].sort(
      (a, b) => a.aiConfidenceScore - b.aiConfidenceScore,
    ),
  }
}
