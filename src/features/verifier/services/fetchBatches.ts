import type { VerificationBatch } from '@/features/verifier/types'
import { mockBatches } from '@/features/verifier/data/mockBatches'

/**
 * Single data seam for the batch queue (V-03). Returns batches **smart-sorted**:
 * actionable (Pending) first, then anomaly-flagged, then lowest AI confidence —
 * so the work that needs the verifier surfaces to the top automatically (per
 * spec). When the verifier API is ready, replace ONLY the body below:
 *
 *   const apiBase = process.env.FARMFLOW_API_URL
 *   const cookieHeader = await forwardVerifierCookie()
 *   const res = await fetch(`${apiBase}/verifier/batches`, {
 *     headers: { cookie: cookieHeader },
 *     cache: 'no-store',
 *   })
 *   if (!res.ok) return []
 *   const json = (await res.json()) as { data?: VerificationBatch[] }
 *   return json.data ?? []
 */
export async function fetchBatches(): Promise<VerificationBatch[]> {
  return [...mockBatches].sort((a, b) => {
    // Actionable (Pending) batches first — resolved ones drop below the queue…
    const aPending = a.status === 'Pending' ? 0 : 1
    const bPending = b.status === 'Pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    // …then flagged first…
    if (a.anomalyFlag !== b.anomalyFlag) return a.anomalyFlag ? -1 : 1
    // …then lowest confidence first.
    return a.avgConfidence - b.avgConfidence
  })
}
